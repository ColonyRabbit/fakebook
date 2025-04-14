import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { authOptions } from "../../../../../lib/authOptions";

export async function POST(request: Request, context: any) {
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

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!currentUser) {
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

    // ตรวจสอบว่า user นั้นติดตาม target user จริงๆ หรือไม่
    const existingFollow = await prisma.follower.findFirst({
      where: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    });

    if (!existingFollow) {
      return NextResponse.json(
        { error: "User is not following the target user" },
        { status: 400 }
      );
    }

    // ทำการยกเลิกการติดตาม
    await prisma.follower.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });

    return NextResponse.json({ message: "Successfully unfollowed" });
  } catch (error: any) {
    console.error("Error in unfollow endpoint:", error);
    return NextResponse.json(
      { error: "Failed to unfollow user", details: error.message },
      { status: 500 }
    );
  }
}
