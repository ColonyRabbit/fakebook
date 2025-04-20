// components/FloatingChat.tsx
"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { globalStateChat } from "../app/store/globalStateChat";
import { Button } from "../../@/components/ui/button";
import { RealtimeChat } from "../../@/components/realtime-chat";

export default function FloatingChat({
  session,
  roomName,
}: {
  session: any;
  roomName: string;
}) {
  const { isChatOpen, toggleChat } = globalStateChat();

  return (
    <>
      <Button
        onClick={toggleChat}
        className="bg-blue-600 text-white p-4 flex items-center gap-2 shadow-lg z-50"
      >
        <MessageCircle size={24} /> <p>ส่งข้อความ</p>
      </Button>

      {isChatOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[500px] bg-white dark:bg-zinc-900 border rounded-lg shadow-xl z-50 overflow-hidden">
          <RealtimeChat roomName={roomName} session={session} />
        </div>
      )}
    </>
  );
}
