import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

// เปลี่ยนจาก params เป็น context.params และใช้ async/await อย่างถูกต้อง
export async function POST(
  req: NextRequest,
  context: { params: { postId: string } }
) {
  try {
    // ตรวจสอบว่ามีผู้ใช้ที่ล็อกอินอยู่หรือไม่
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // ใช้ context.params แทน params
    const postId = context.params.postId.toString();
    const userId = session.id;

    // ตรวจสอบว่าโพสต์มีอยู่จริงหรือไม่
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // ตรวจสอบว่าผู้ใช้เคยกดไลค์โพสต์นี้แล้วหรือไม่
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    // ถ้าเคยกดไลค์แล้ว ให้ลบไลค์ออก (unlike)
    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: userId,
            postId: postId,
          },
        },
      });
    }
    // ถ้ายังไม่เคยกดไลค์ ให้สร้างไลค์ใหม่
    else {
      await prisma.like.create({
        data: {
          userId: userId,
          postId: postId,
        },
      });
    }

    // ดึงข้อมูลโพสต์ที่อัปเดตแล้ว พร้อมข้อมูลที่จำเป็น
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        likes: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    // ตรวจสอบว่าผู้ใช้ปัจจุบันกดไลค์โพสต์นี้หรือไม่
    const isLiked =
      updatedPost?.likes.some((like) => like.userId === userId) || false;

    // ส่งข้อมูลกลับไปยัง client
    return NextResponse.json({
      id: updatedPost?.id,
      content: updatedPost?.content,
      createdAt: updatedPost?.createdAt,
      updatedAt: updatedPost?.updatedAt,
      username: updatedPost?.user?.username,
      user: updatedPost?.user,
      isLiked: isLiked,
      likeCount: updatedPost?._count?.likes,
    });
  } catch (error) {
    console.error("Error handling like:", error);
    return NextResponse.json(
      { error: "Failed to process like" },
      { status: 500 }
    );
  }
}
