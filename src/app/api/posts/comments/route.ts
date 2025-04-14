import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const { postId, comment, sender } = await request.json();

    // ตรวจสอบว่า postId ถูกส่งมาหรือไม่
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }
    // ตรวจสอบ sender ว่าเป็น string และมีค่า
    if (typeof sender !== "string" || !sender) {
      return NextResponse.json({ error: "Invalid sender ID" }, { status: 400 });
    }
    // ตรวจสอบว่า comment มีค่า
    if (!comment) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // สร้าง comment ใหม่ในฐานข้อมูล
    const newComment = await prisma.comment.create({
      data: {
        content: comment,
        postId,
        userId: sender,
      },
    });

    return NextResponse.json(
      { message: "Comment created successfully", newComment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // อ่านข้อมูลจาก request body โดยคาดว่าจะได้รับ commentId และ content
    const { commentId, content } = await request.json();

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // ทำการอัปเดตคอมเมนต์ในฐานข้อมูลด้วย commentId ที่ส่งเข้ามา
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    return NextResponse.json(
      { message: "Comment updated successfully", updatedComment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const { commentId } = await request.json();

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    const deleteComment = await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json(
      { message: "Comment delete successfully", deleteComment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error delete comment:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
