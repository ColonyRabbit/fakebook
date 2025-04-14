import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/authOptions";
import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export async function GET(request: Request, context: any) {
  const session = await getServerSession(authOptions);
  const { postId } = context.params;
  if (!session || !postId) {
    return NextResponse.json(
      { error: "Missing userId or postId" },
      { status: 400 }
    );
  }
  const allComments = await prisma.comment.findMany({
    where: { postId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ comments: allComments }, { status: 200 });
}
