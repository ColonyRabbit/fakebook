// app/api/posts/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";

// [GET] /api/posts
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page"));
    const limit = parseInt(searchParams.get("limit"));
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
        likes: session?.user?.id
          ? {
              where: { userId: session.user.id },
              select: { userId: true },
            }
          : undefined,
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
      isLiked: !!post.likes?.length,
      comments: post._count.comments,
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
    const { content, userId } = await request.json();

    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newPost = await prisma.post.create({
      data: { content, userId },
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
    const { content, postId } = await request.json();

    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!postId || !content)
      return NextResponse.json(
        { error: "Missing postId or content" },
        { status: 400 }
      );

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!existingPost)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });

    if (existingPost.userId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { content },
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

    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!postId)
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!existingPost)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });

    if (existingPost.userId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const deletedPost = await prisma.post.delete({ where: { id: postId } });

    return NextResponse.json({ message: "Post deleted", post: deletedPost });
  } catch (error: any) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
