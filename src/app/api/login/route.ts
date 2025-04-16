import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    // รับข้อมูลจาก client ผ่าน JSON
    const { email, password } = await request.json();

    // ค้นหาผู้ใช้ตาม email ในฐานข้อมูลด้วย Prisma
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("User found in database:", user); // สำหรับดีบัก
    if (!user) {
      console.log("Login failed: user not found");
      return NextResponse.json(
        { error: "login_error", error_msg: "รหัสไม่ถูกต้อง!" },
        { status: 401 }
      );
    }

    // ใช้ bcrypt เปรียบเทียบ password แบบ asynchronous
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Login failed: invalid password for user", user.email);
      return NextResponse.json(
        { error: "login_error", error_msg: "รหัสไม่ถูกต้อง!" },
        { status: 401 }
      );
    }

    // สร้าง JWT access token ด้วยข้อมูลที่ต้องการเก็บลงใน token
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET as string, // ระบุว่า JWT_SECRET ต้องไม่เป็น undefined
      { expiresIn: "7d" }
    );
    console.log("User found:", user); // สำหรับดีบัก

    // ส่งข้อมูลผู้ใช้ (รวมทั้ง id ที่ได้จาก database) พร้อม accessToken กลับไป
    return NextResponse.json(
      {
        id: user.id,
        name: user.username,
        email: user.email,
        photoUrl: user!.photoUrl,
        accessToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "server_error",
        error_msg: "เกิดข้อผิดพลาดในระบบ",
      },
      { status: 500 }
    );
  }
}
