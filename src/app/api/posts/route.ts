import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// app/api/posts/route.ts
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      include: {
        user: true,
        _count: { select: { likes: true } },
        likes: session.user?.id
          ? {
              where: { userId: session.user?.id },
              select: { userId: true },
            }
          : undefined,
      },
      orderBy: { createdAt: "desc" },
    });

    // แปลงข้อมูลให้มีรูปแบบที่ต้องการ
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      photoUrl: post.user.photoUrl,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      userId: post.userId,
      user: post.user,
      likeCount: post._count.likes,
      // สถานะ like ของผู้ใช้ปัจจุบัน
      isLiked: session.user?.id ? post.likes.length > 0 : false,
      comments: post.content, // ถ้าต้องการ
    }));

    const totalPosts = await prisma.post.count();

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์" },
      { status: 500 }
    );
  }
}
//post
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { content, userId } = await request.json();
    await prisma.post.create({
      data: {
        content,
        userId,
      },
    });
    return NextResponse.json(
      { message: "Post created successfully", content },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
//patch
export async function PATCH(request: Request) {
  try {
    // ตรวจสอบ session ก่อน
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // แก้ไขให้ใช้ชื่อ postId แทน userId เพราะเราต้องการอัปเดตโพสต์
    const { content, postId } = await request.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: "postId and content are required" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามีโพสต์ที่ต้องการอัปเดตอยู่หรือไม่
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // ตรวจสอบว่าผู้ใช้ที่ล็อกอินเป็นเจ้าของโพสต์หรือไม่
    if (existingPost.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to update this post" },
        { status: 403 }
      );
    }

    // อัปเดตโพสต์ใหม่
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content,
      },
    });

    return NextResponse.json(
      { message: "Post updated successfully", updatedPost },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in PATCH request:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
//delete
export async function DELETE(request: Request) {
  try {
    // ตรวจสอบ session ก่อน
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "postId  are required" },
        { status: 400 }
      );
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // ตรวจสอบว่าผู้ใช้ที่ล็อกอินเป็นเจ้าของโพสต์หรือไม่
    if (existingPost.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to update this post" },
        { status: 403 }
      );
    }

    // อัปเดตโพสต์ใหม่
    const updatedPost = await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json(
      { message: "Post Delete successfully", updatedPost },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in PATCH request:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
