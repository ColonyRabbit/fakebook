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
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "อีเมลหรือชื่อผู้ใช้นี้มีอยู่แล้ว" },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let photoUrl = null;
    if (file) {
      const s3Url = process.env.AWS_S3_URL;
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
      photoUrl = `${s3Url}/${fileName}`;
    }
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword, photoUrl },
    });
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(
      { message: "ลงทะเบียนสำเร็จ", user: userWithoutPassword },
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
