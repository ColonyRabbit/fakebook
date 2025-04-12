import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// app/api/posts/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // ดึง userId จาก session หรือ token (ตัวอย่าง)
    // ในสถานการณ์จริง คุณต้องดึง userId จาก session หรือ token ที่ส่งมากับ request
    const currentUserId = searchParams.get("userId") || null;

    // ดึงรายการโพสต์พร้อมข้อมูลผู้ใช้และจำนวนไลค์
    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        postText: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            photoUrl: true,
          },
        },
        // นับจำนวน likes ทั้งหมดของโพสต์
        _count: {
          select: {
            likes: true,
          },
        },
        // ตรวจสอบว่าผู้ใช้ปัจจุบันกดไลค์หรือไม่ (ถ้ามี userId)
        likes: currentUserId
          ? {
              where: {
                userId: currentUserId,
              },
              select: {
                userId: true,
              },
            }
          : undefined,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // แปลงข้อมูลให้มีรูปแบบที่ต้องการ
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      photoUrl: post.user.photoUrl,
      postText: post.postText,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      userId: post.userId,
      user: post.user,
      likeCount: post._count.likes,
      isLiked: currentUserId ? post.likes.length > 0 : false,
    }));

    // นับจำนวนโพสต์ทั้งหมด
    const totalPosts = await prisma.post.count();

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์" },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const { postText, userId } = await request.json();

    // ตรวจสอบว่ามี postText และ userId หรือไม่
    if (!postText || !userId) {
      return NextResponse.json(
        { error: "โพสต์ล้มเหลว กรุณาลองใหม่อีกครั้ง" },
        { status: 400 }
      );
    }

    // สร้างโพสต์ใหม่ในฐานข้อมูล
    const newPost = await prisma.post.create({
      data: {
        postText,
        userId,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างโพสต์" },
      { status: 500 }
    );
  }
}
