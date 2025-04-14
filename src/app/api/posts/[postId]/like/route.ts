import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/authOptions";
import prisma from "../../../../../../lib/prisma";

export async function POST(request: Request, context: any) {
  try {
    // ดึง session จาก NextAuth
    const session = await getServerSession(authOptions);
    // รับ target post ID จาก context (ไม่ต้อง await กับ params)
    const { postId } = context.params;

    if (!session || !postId) {
      return NextResponse.json(
        { error: "Missing userId or postId" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามี like อยู่แล้วหรือไม่
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingLike) {
      // หากมี like อยู่แล้ว ให้ลบไลค์ (unlike)
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      });
    } else {
      // หากไม่มีให้เพิ่มไลค์ (like)
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });
    }

    // ดึงข้อมูลโพสต์ล่าสุดพร้อมจำนวนไลค์
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        _count: {
          select: { likes: true },
        },
        likes: {
          where: { userId: session.user.id },
          select: { userId: true },
        },
      },
    });

    return NextResponse.json(
      { ...updatedPost, alreadyLike: !!existingLike },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการจัดการไลค์", details: error.message },
      { status: 500 }
    );
  }
}
