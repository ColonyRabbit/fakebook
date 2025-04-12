import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../../../lib/prisma";
import { cookies } from "next/headers";

// กำหนด secret key สำหรับการเข้ารหัส JWT
// ควรเก็บไว้ใน environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ค้นหาผู้ใช้จาก email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // ถ้าไม่พบผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // สร้าง payload สำหรับ JWT token
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    // สร้าง JWT token
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d", // token หมดอายุใน 7 วัน
    });

    // ตั้งค่า cookie
    (
      await // ตั้งค่า cookie
      cookies()
    ).set({
      name: "authToken", // เปลี่ยนชื่อ cookie เป็น authToken
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // ส่งข้อมูลผู้ใช้กลับไป (ไม่รวมรหัสผ่าน)
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return NextResponse.json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" },
      { status: 500 }
    );
  }
}
