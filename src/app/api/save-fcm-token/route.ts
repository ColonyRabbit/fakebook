import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { token, userId } = await req.json();

  if (!token || !userId) {
    return NextResponse.json(
      { error: "Missing token or userId" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("fcm_tokens")
    .insert({ token, user_id: userId });

  if (error) {
    console.error("❌ Supabase insert error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
