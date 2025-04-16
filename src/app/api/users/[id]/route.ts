// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(request: Request, context: any) {
  try {
    const { id } = context.params;
    if (!id) {
      return new Response("id is required", { status: 400 });
    }
    // ดึงข้อมูลผู้ใช้พร้อมข้อมูลของผู้ติดตาม
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        followers: {
          include: { follower: true },
        },
        following: {
          include: { following: true },
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
