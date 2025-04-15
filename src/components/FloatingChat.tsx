// components/FloatingChat.tsx
"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { RealtimeChat } from "../../@/components/realtime-chat";
import { globalStateChat } from "../app/store/globalStateChat";

export default function FloatingChat({ username }: { username: string }) {
  const { isChatOpen, toggleChat } = globalStateChat();

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50"
      >
        <MessageCircle size={24} />
      </button>

      {isChatOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[500px] bg-white dark:bg-zinc-900 border rounded-lg shadow-xl z-50 overflow-hidden">
          <RealtimeChat roomName="my-chat-room" username={username} />
        </div>
      )}
    </>
  );
}
