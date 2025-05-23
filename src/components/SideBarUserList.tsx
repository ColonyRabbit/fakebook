"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import userApi from "../app/service/usersApi";
import FloatingChatWrapper from "./FloatingChatWrapper";
import { globalStateChat } from "../app/store/globalStateChat";

const SideBarUserList: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [followerList, setFollowerList] = useState<any[]>([]);
  const { toggleChat, openChats } = globalStateChat();

  useEffect(() => {
    const fetchUserFollowers = async () => {
      if (!session?.user?.id) return;

      try {
        const userData = await userApi.getOneUser(session.user.id);
        const followings = userData.following?.map(
          (relation: any) => relation.following
        );
        setFollowerList(followings || []);
      } catch (error) {
        console.error("Error fetching followers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFollowers();
  }, [session?.user?.id]);

  return (
    <>
      <nav className="w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-8 px-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          คนที่คุณติดตาม
        </h2>
        <ul className="space-y-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <li className="text-gray-500 dark:text-gray-400 text-sm">
              กำลังโหลด...
            </li>
          ) : followerList.length > 0 ? (
            followerList.map((follower) => (
              <li key={follower.id}>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {follower.photoUrl ? (
                    <Image
                      src={follower.photoUrl}
                      alt={follower.username}
                      width={32}
                      height={32}
                      className="rounded-full w-8 h-8 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {follower.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {follower.username}
                  </span>
                  <button
                    onClick={() => toggleChat(follower.id)}
                    className="text-blue-500 hover:underline text-sm ml-auto"
                  >
                    แชท
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-500 dark:text-gray-400 text-sm px-2 py-1">
              ไม่พบผู้ติดตาม
            </li>
          )}
        </ul>
      </nav>

      {Object.keys(openChats).map((userId, index) => {
        const user = followerList.find((u) => u.id === userId);
        if (!user || !openChats[userId]) return null;

        const chatWidth = 320;
        const gap = 16;
        const rightOffset = gap + index * (chatWidth + gap);

        return (
          <div
            key={user.id}
            style={{
              position: "fixed",
              bottom: 16,
              right: rightOffset,
              zIndex: 50,
              width: chatWidth,
            }}
          >
            <FloatingChatWrapper session={session} targetUserId={user.id} />
          </div>
        );
      })}
    </>
  );
};

export default SideBarUserList;
