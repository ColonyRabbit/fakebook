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
  const currentUserId = session?.user?.id;

  useEffect(() => {
    // ✅ ต้องแน่ใจว่ามี session ก่อน
    if (!session?.user?.id) return;
  
    const currentUserId = session.user.id;
  
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
  
          // ✅ เงื่อนไขนี้จะทำงานถูกต้องเมื่อ user_id !== currentUserId
          if (
            msg.target_id === currentUserId &&
            msg.user_id !== currentUserId
          ) {
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
  }, [session]); // ✅ ให้ wait จน session มาครบ
  
