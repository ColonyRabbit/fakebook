"use server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

interface JwtPayload {
  userId: string; // เปลี่ยนเป็น string เพราะ Prisma ใช้ string ID
  username: string;
  email: string;
  iat: number;
  exp: number;
}

export async function getCurrentUser() {
  try {
    // ดึง token จาก cookie
    const token = (await cookies()).get("authToken")?.value;

    if (!token) {
      return null;
    }

    // ถอดรหัส token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // ดึงข้อมูลผู้ใช้จาก database เพื่อให้ได้ข้อมูลล่าสุด
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId, // ไม่ต้องแปลงเป็น string ถ้า userId เป็น string อยู่แล้ว
      },
      select: {
        id: true,
        username: true,
        email: true,
        photo: true,
        // ไม่รวม password เพื่อความปลอดภัย
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
