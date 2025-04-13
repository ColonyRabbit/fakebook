import { NextRequest } from "next/server";
import prisma from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { searchText } = await request.json();

    if (!searchText.trim()) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [{ username: { contains: searchText, mode: "insensitive" } }],
      },
      select: {
        id: true,
        username: true,
        email: true,
        photoUrl: true,
        followers: true,
      },
      take: 10, // จำกัดจำนวนผลลัพธ์เพื่อประสิทธิภาพ
    });

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
