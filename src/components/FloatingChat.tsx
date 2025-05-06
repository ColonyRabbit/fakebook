"use client";

import { MessageCircle, X } from "lucide-react";
import { globalStateChat } from "../app/store/globalStateChat";
import { Button } from "../../@/components/ui/button";
import { RealtimeChat } from "../../@/components/realtime-chat";
import { usePathname } from "next/navigation";

export default function FloatingChat({
  session,
  roomName,
  targetUserId,
  className,
}: {
  targetUserId: string;
  session: any;
  roomName: string;
  className?: string;
}) {
  const { toggleChat, closeChat, openChats } = globalStateChat();
  const isOpen = openChats[targetUserId];
  const pathName = usePathname();

  return (
    <>
      {pathName !== "/" && (
        <Button
          onClick={() => toggleChat(targetUserId)}
          className="bg-blue-600 text-white p-4 flex items-center gap-2 shadow-lg z-50"
        >
          <MessageCircle size={24} />
          <span>ส่งข้อความ</span>
        </Button>
      )}

      {isOpen && (
        <div
          className={`h-[500px] right-10 bg-white dark:bg-zinc-900 border rounded-lg shadow-xl z-50 overflow-hidden ${className}`}
        >
          <div className="flex justify-between items-center p-2 border-b dark:border-zinc-700">
            <span className="font-semibold text-gray-800 dark:text-white">
              แชท
            </span>
            <button
              onClick={() => closeChat(targetUserId)}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <RealtimeChat
            targetUserId={targetUserId}
            roomName={roomName}
            session={session}
            onClose={() => closeChat(targetUserId)}
          />
        </div>
      )}
    </>
  );
}
