import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    // รับข้อมูล userId จาก body
    const session = await getServerSession(authOptions);
    // await ค่า params ก่อนใช้งาน
    const { postId } = await Promise.resolve(params);

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
      // ลบไลค์ออก (unlike)
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      });
    } else {
      // เพิ่มไลค์ (like)
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
      { ...updatedPost, alreadyLike: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการจัดการไลค์" },
      { status: 500 }
    );
  }
}
