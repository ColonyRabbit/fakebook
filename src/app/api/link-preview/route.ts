// ✅ API route สำหรับ App Router
import { getLinkPreview } from "link-preview-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    const data = await getLinkPreview(url);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Link preview error:", err);
    return NextResponse.json(
      { error: "Cannot fetch preview" },
      { status: 500 }
    );
  }
}
