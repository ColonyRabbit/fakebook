import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/authOptions";
import prisma from "../../../../../lib/prisma";

export async function POST(request: Request, context: any) {
  try {
    // ดึง session จาก NextAuth
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // รับ targetUserId จาก context
    const { targetUserId } = context.params;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId is required" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าผู้ใช้ปัจจุบันมีอยู่ในฐานข้อมูลหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!existingUser) {
      return NextResponse.json(
        { error: "Current user not found in database" },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าผู้ใช้เป้าหมายมีอยู่ในฐานข้อมูลหรือไม่
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      return NextResponse.json(
        { alreadyFollowing: false, error: "Target user not found" },
        { status: 404 }
      );
    }

    // ตรวจสอบสถานะการติดตาม
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });
    if (existingFollow) {
      return NextResponse.json(
        { alreadyFollowing: true, message: "Already following" },
        { status: 200 }
      );
    }

    // สร้าง record การติดตามใหม่
    await prisma.follower.create({
      data: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    });

    return NextResponse.json({
      alreadyFollowing: false,
      message: "Followed successfully",
    });
  } catch (error: any) {
    console.error("Error following user:", error);
    return NextResponse.json(
      {
        alreadyFollowing: false,
        error: "Failed to follow user",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, context: any) {
  try {
    const { targetUserId } = context.params;
    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId is required" },
        { status: 400 }
      );
    }
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });
    return NextResponse.json({ alreadyFollowing: !!existingFollow });
  } catch (error: any) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      { error: "Failed to check follow status", details: error.message },
      { status: 500 }
    );
  }
}
