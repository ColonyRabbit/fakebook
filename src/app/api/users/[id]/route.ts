// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return new Response("id is required", { status: 400 });
    }
    // ดึงข้อมูลผู้ใช้พร้อมข้อมูลของผู้ติดตาม
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        // ดึงข้อมูลของผู้ติดตาม (follower) โดย include user ใน relation "UserFollowing"
        // (โดยที่ใน model Follower ความสัมพันธ์ระหว่าง follower กับ target จะถูกกำหนดโดย
        //  follower: User @relation("UserFollowing", ...))
        followers: {
          include: {
            // ดึงข้อมูลของผู้ที่ทำการติดตาม
            follower: true,
          },
        },
        // หากต้องการข้อมูลของ people ที่ผู้ใช้ติดตาม (following) ให้ include แบบนี้ได้เช่นกัน
        following: {
          include: {
            following: true,
          },
        },
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in GET request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
