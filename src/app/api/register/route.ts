// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const username = formData.get("username")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const file = formData.get("profileImage") as File | null;

    if (!username || !email || !password) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // ตรวจสอบว่ามีผู้ใช้ที่ใช้ email หรือ username นี้อยู่แล้วหรือไม่
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "อีเมลหรือชื่อผู้ใช้นี้มีอยู่แล้ว" },
        { status: 400 }
      );
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);
    let photoUrl = null;
    if (file) {
      const fileName = `uploads/${Date.now()}-${file.name}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.type,
      };
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      photoUrl = `${process.env.AWS_S3_URL}/${fileName}`;
    }

    // สร้างผู้ใช้ใหม่ในฐานข้อมูล
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword, photoUrl },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(
      { message: "ลงทะเบียนเรียบร้อย", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการลงทะเบียน" },
      { status: 500 }
    );
  }
}
export async function PATCH(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get("userId")?.toString();
    const username = formData.get("username")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const file = formData.get("profileImage") as File | null;

    if (!userId || !username || !email) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // ตรวจสอบว่าผู้ใช้ที่มี userId นี้มีอยู่ในระบบหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      return NextResponse.json({ error: "ผู้ใช้ไม่พบ" }, { status: 404 });
    }

    // หากมีการเปลี่ยนรหัสผ่าน, ทำการเข้ารหัสใหม่
    let hashedPassword = existingUser.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // หากมีการอัปโหลดภาพโปรไฟล์ ให้อัปโหลดไปยัง S3 แล้วอัปเดต URL
    let photoUrl = existingUser.photoUrl;
    if (file instanceof File) {
      const fileName = `uploads/${Date.now()}-${file.name}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.type,
      };
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      photoUrl = `${process.env.AWS_S3_URL}/${fileName}`;
    }

    // อัปเดตข้อมูลผู้ใช้ในฐานข้อมูล
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        email,
        password: hashedPassword,
        photoUrl,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(
      { message: "ข้อมูลอัปเดตเรียบร้อย", user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user information:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" },
      { status: 500 }
    );
  }
}
