import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getSession } from "next-auth/react";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const targetUserId = params.id;
    console.log(session);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Current user not found in database" },
        { status: 404 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // ตรวจสอบก่อนว่าเคยติดตามไปแล้วหรือยัง
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id, // คนที่กดติดตาม
          followingId: targetUserId, // คนที่ถูกติดตาม
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: "Already following" }, { status: 400 });
    }

    // สร้างข้อมูลการติดตามใหม่ (แก้ไขตรงนี้ให้ถูกต้อง)
    await prisma.follower.create({
      data: {
        followerId: session.user.id, // คนที่กดติดตาม
        followingId: targetUserId, // คนที่ถูกติดตาม
      },
    });

    return NextResponse.json({ message: "Followed successfully" });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Failed to follow user", details: error.message },
      { status: 500 }
    );
  }
}
