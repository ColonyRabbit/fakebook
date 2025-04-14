import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  const { postId } = await Promise.resolve(params);
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
