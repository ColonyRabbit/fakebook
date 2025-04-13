import prisma from "../../../../../lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new Response("id is required", { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: true,
        likes: true,
        comments: true,
        followers: true,
        following: true,
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
