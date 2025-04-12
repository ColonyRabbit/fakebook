import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // ถ้าไม่พบ session => ส่ง 401 (Unauthorized) กลับ
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.id;

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

    await prisma.follower.create({
      data: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    });

    return NextResponse.json({ message: "Followed successfully" });
  } catch (error: any) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Failed to follow user", details: error.message },
      { status: 500 }
    );
  }
}
