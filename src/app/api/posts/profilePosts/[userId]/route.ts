import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../../lib/authOptions";
import prisma from "../../../../../../lib/prisma";

// [GET] /api/posts/[userId]
export async function GET(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const totalPosts = await prisma.post.count();
    const totalPages = Math.ceil(totalPosts / limit);
    const hasMore = page < totalPages;
    const skip = (page - 1) * limit;
    const { userId } = context.params;
    if (!session || !userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const posts = await prisma.post.findMany({
      where: {
        userId: userId,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
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
      fileUrl: post.fileUrl,
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
