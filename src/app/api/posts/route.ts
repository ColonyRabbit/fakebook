import { NextResponse } from "next/server";
import { Buffer } from "buffer";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// [GET] /api/posts
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const totalPosts = await prisma.post.count();
    const totalPages = Math.ceil(totalPosts / limit);
    const hasMore = page < totalPages;

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      include: {
        user: true,
        _count: { select: { likes: true, comments: true } },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      userId: post.userId,
      user: post.user,
      photoUrl: post.user.photoUrl,
      likeCount: post._count.likes,
      isLiked: post.likes.some((like) => like.userId === session?.user?.id),
      comments: post._count.comments,
      fileUrl: post.fileUrl,
      likes: post.likes, // ✅ ใส่ไว้เพื่อส่งไปยัง client
    }));

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// [POST] /api/posts
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const formData = await request.formData();
    const content = formData.get("content")?.toString() || "";
    const userId = formData.get("userId")?.toString() || "";
    const file = formData.get("file") as File | null;

    // 🔒 Validate session & inputs
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // ✅ Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let photoUrl = null;
    if (file instanceof File) {
      const fileName = `uploads/${Date.now()}-${file.name}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.type,
      };
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      photoUrl = `${process.env.AWS_S3_URL}/${fileName}`;
    }

    const newPost = await prisma.post.create({
      data: {
        content,
        userId,
        fileUrl: photoUrl,
      },
    });

    return NextResponse.json(
      { message: "Post created successfully", post: newPost },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}

// [PATCH] /api/posts
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const formData = await request.formData();

    const content = formData.get("content")?.toString();
    const postId = formData.get("postId")?.toString();
    const file = formData.get("file");

    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!postId || !content)
      return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });

    if (existingPost.userId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let fileUrl = existingPost.fileUrl;

    if (typeof file === "string" && file === "") {
      fileUrl = null;
    }

    if (file instanceof File) {
      const fileName = `uploads/${Date.now()}-${file.name}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.type,
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      fileUrl = `${process.env.AWS_S3_URL}/${fileName}`;
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content,
        fileUrl,
      },
    });

    return NextResponse.json({ message: "Post updated", post: updatedPost });
  } catch (error: any) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// [DELETE] /api/posts
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { postId } = await request.json();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deletedPost = await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({
      message: "Post deleted successfully",
      post: deletedPost,
    });
  } catch (error: any) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
