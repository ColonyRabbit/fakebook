// components/NotificationListener.tsx
"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NotificationListener() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "guest";

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("global-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new;
          if (msg.user_id !== userId) {
            toast(`${msg.username} ส่งข้อความมา: ${msg.content}`, {
              icon: "💬",
              duration: 4000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return null; // ไม่ render อะไรเลย แค่ทำหน้าที่ฟัง event
}
