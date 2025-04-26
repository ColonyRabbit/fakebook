// NotificationListener.tsx
"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

const STORAGE_COUNT_KEY = "unreadNotiCount";
const STORAGE_MESSAGES_KEY = "unreadNotiMessages";

export default function NotificationListener() {
  useEffect(() => {
    // ✅ โหลด noti จาก LocalStorage
    const stored = localStorage.getItem(STORAGE_MESSAGES_KEY);
    const messages: string[] = stored ? JSON.parse(stored) : [];

    messages.forEach((msg) => {
      toast(msg, { icon: "💬" });
    });

    // ✅ รับข้อความจาก Service Worker
    const bc = new BroadcastChannel("fcm_channel");

    bc.onmessage = (event) => {
      const { title, body } = event.data;
      const msg = `${title}: ${body}`;

      const prev = JSON.parse(
        localStorage.getItem(STORAGE_MESSAGES_KEY) || "[]"
      );
      const updated = [...prev, msg];

      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(updated));
      localStorage.setItem(STORAGE_COUNT_KEY, updated.length.toString());

      toast(msg, { icon: "💬" });
    };

    return () => {
      bc.close();
    };
  }, []);

  return null;
}
