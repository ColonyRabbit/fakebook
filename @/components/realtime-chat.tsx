"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { Session } from "next-auth";
import toast from "react-hot-toast";
import { useNotificationStore } from "../../src/app/store/Notification";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Message = {
  id: string;
  content: string;
  user_id: string;
  username: string;
  photo_url?: string;
  created_at: string;
  room: string;
};

export function RealtimeChat({
  roomName,
  session,
  targetUserId,
}: {
  roomName: string;
  session: Session | null;
  targetUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState<Boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const username = session?.user?.name ?? "Guest";
  const userId = session?.user?.id ?? "guest"; // 👈 สำคัญ!

  const sendMessage = async () => {
    if (input.trim() === "") return;

    setSending(true);

    const newMessage = {
      content: input,
      user_id: userId,
      username,
      room: roomName,
      target_id: targetUserId,
    };

    const { data, error } = await supabase
      .from("messages")
      .insert(newMessage)
      .select()
      .single();

    setSending(false);
    if (error) {
      console.error("❌ Insert error:", error.message);
      return;
    }

    if (data) {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === data.id);
        return exists ? prev : [...prev, data];
      });

      // 🎯 เรียก Push Notification API
      try {
        const res = await fetch(`/api/fcm-token/${targetUserId}`);
        const { token: targetFcmToken } = await res.json();

        if (targetFcmToken) {
          await fetch("/api/push/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              targetFcmToken,
              title: `ข้อความใหม่จาก ${username}`,
              body: input,
            }),
          });
        }
      } catch (err) {
        console.warn("⚠️ ส่ง Push ไม่สำเร็จ:", err);
      }
    }

    setInput("");
  };

  // Load messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("room", roomName)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
      if (error) console.error("Fetch error:", error.message);
    };

    loadMessages();
  }, [roomName]);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`room-${roomName}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message;

          if (newMessage.room === roomName) {
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === newMessage.id);
              return exists ? prev : [...prev, newMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomName, userId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          const isOwnMessage = msg.user_id === userId;

          return (
            <div
              key={msg.id}
              className={`flex ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  isOwnMessage
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white rounded-bl-none"
                }`}
              >
                {!isOwnMessage && (
                  <div className="flex items-center gap-2 mb-1">
                    {msg.photo_url ? (
                      <Image
                        alt={msg.username}
                        src={msg.photo_url}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                        {msg.username[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold">
                      {msg.username}
                    </span>
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex space-x-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-2 border rounded"
          placeholder="พิมพ์ข้อความ..."
        />
        {sending ? (
          <p className="bg-blue-600 text-white px-4 rounded">กำลังส่ง...</p>
        ) : (
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 rounded"
          >
            ส่ง
          </button>
        )}
      </div>
    </div>
  );
}
