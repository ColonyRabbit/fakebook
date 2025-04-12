// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, photo } = body;

    // ตรวจสอบว่า email หรือ username มีอยู่แล้วหรือไม่
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "อีเมลหรือชื่อผู้ใช้นี้มีอยู่แล้ว" },
        { status: 400 }
      );
    }

    // เข้ารหัสพาสเวิร์ด
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างผู้ใช้ใหม่
    const newUser = await prisma.user.create({
      data: {
        photo: photo || null,
        username,
        email,
        password: hashedPassword,
      },
    });

    // ไม่ส่งรหัสผ่านกลับไป
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        message: "ลงทะเบียนสำเร็จ",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลงทะเบียน" },
      { status: 500 }
    );
  }
}
