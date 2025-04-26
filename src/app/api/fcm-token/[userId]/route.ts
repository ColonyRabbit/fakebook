import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ต้องสร้าง supabase client แบบ server-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ⬇️ แก้ type context ให้ถูกต้อง
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  const { data, error } = await supabase
    .from("fcm_tokens")
    .select("token")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ token: null }, { status: 404 });
  }

  return NextResponse.json({ token: data.token }, { status: 200 });
}
