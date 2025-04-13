import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get("userId")?.toString();
    const username = formData.get("username")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const file = formData.get("profileImage") as File | null | string;

    if (!userId || !username || !email) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "ผู้ใช้ไม่พบ" }, { status: 404 });
    }

    let hashedPassword = existingUser.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

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

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        email,
        password: hashedPassword,
        photoUrl: photoUrl || file.toString(),
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(
      { message: "ข้อมูลอัปเดตเรียบร้อย", user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user information:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" },
      { status: 500 }
    );
  }
}
