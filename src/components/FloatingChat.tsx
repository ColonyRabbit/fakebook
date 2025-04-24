// components/FloatingChat.tsx
"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { globalStateChat } from "../app/store/globalStateChat";
import { Button } from "../../@/components/ui/button";
import { RealtimeChat } from "../../@/components/realtime-chat";
import { usePathname } from "next/navigation";

export default function FloatingChat({
  session,
  roomName,
  targetUserId,
}: {
  targetUserId: string;
  session: any;
  roomName: string;
}) {
  const { isChatOpen, toggleChat } = globalStateChat();
  //use Pathname
  const pathName = usePathname();
  return (
    <>
      {pathName === "/" ? null : (
        <Button
          onClick={toggleChat}
          className="bg-blue-600 text-white p-4 flex items-center gap-2 shadow-lg z-50"
        >
          <MessageCircle size={24} /> <p>ส่งข้อความ</p>
        </Button>
      )}

      <div className="fixed bottom-0 right-24 w-96 h-[500px] bg-white dark:bg-zinc-900 border rounded-lg shadow-xl z-50 overflow-hidden">
        <RealtimeChat
          targetUserId={targetUserId}
          roomName={roomName}
          session={session}
        />
      </div>
    </>
  );
}
