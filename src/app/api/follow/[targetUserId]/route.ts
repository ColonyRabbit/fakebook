import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import prisma from "../../../../../lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { targetUserId: string } }
) {
  try {
    // ดึง session จาก NextAuth
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ดึง targetUserId จาก dynamic route parameter
    const { targetUserId } = params;
    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId is required" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าผู้ใช้ปัจจุบัน (current user) มีอยู่ในฐานข้อมูลหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!existingUser) {
      return NextResponse.json(
        { error: "Current user not found in database" },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าผู้ใช้เป้าหมาย (target user) มีอยู่ในฐานข้อมูลหรือไม่
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      return NextResponse.json(
        { alreadyFollowing: false, error: "Target user not found" },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าผู้ใช้ปัจจุบันได้ติดตามผู้ใช้เป้าหมายแล้วหรือยัง
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });
    if (existingFollow) {
      // หากมีข้อมูลการติดตามอยู่แล้ว ให้ส่งกลับสถานะและข้อความว่า "Already following"
      return NextResponse.json(
        { alreadyFollowing: true, message: "Already following" },
        { status: 200 }
      );
    }

    // หากยังไม่ได้ติดตาม ให้สร้าง record ใหม่ในตาราง follower เพื่อบันทึกการติดตาม
    await prisma.follower.create({
      data: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    });

    // ส่ง response กลับไปเมื่อการติดตามสำเร็จ
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
export async function GET(
  request: Request,
  { params }: { params: { targetUserId: string } }
) {
  try {
    const targetUserId = params.targetUserId;
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
    // หากมีการติดตามอยู่ส่งกลับ { alreadyFollowing: true }
    // หากไม่มีส่งกลับ { alreadyFollowing: false }
    return NextResponse.json({ alreadyFollowing: !!existingFollow });
  } catch (error: any) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      { error: "Failed to check follow status", details: error.message },
      { status: 500 }
    );
  }
}
