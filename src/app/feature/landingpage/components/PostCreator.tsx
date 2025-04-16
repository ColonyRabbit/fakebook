"use client";

import { useState, useRef, useEffect } from "react";
import { ImageIcon, Smile, Camera } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { User } from "@prisma/client";
import { Card } from "../../../../../@/components/ui/card";
import Skeleton from "./Skeleton";
import { Textarea } from "../../../../../@/components/ui/textarea";
import { Button } from "../../../../components/ui/button";

export default function PostCreator() {
  const { data: session, status } = useSession();
  const [content, setContent] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    if (session?.user?.id) {
      const fetchUser = async () => {
        try {
          const response = await fetch(`/api/users/${session.user.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          if (data) {
            setUser(data);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };
      fetchUser();
    }
  }, [session?.user?.id]);

  const handleCreatePost = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content,
          userId: session?.user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "การสร้างโพสต์ล้มเหลว");
      }

      toast.success("โพสต์ของคุณถูกสร้างเรียบร้อยแล้ว");
      setContent("");
      setIsExpanded(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
    setIsLoading(false);
  };

  if (!session) {
    return (
      <Card className="p-4 text-center text-gray-500 dark:text-gray-400">
        โปรดเข้าสู่ระบบเพื่อสร้างโพสต์
      </Card>
    );
  }

  return (
    <div className="flex justify-center max-w-2xl mx-auto p-4 sm:p-6 w-full">
      <Card className="p-4 mb-6  max-w-2xl mx-auto  sm:p-6 w-full">
        <div className="flex items-center space-x-3">
          {user?.photoUrl ? (
            <Image
              src={user.photoUrl}
              className="rounded-full w-12 h-12 ring-2 ring-offset-2 ring-gray-100 dark:ring-gray-800 object-fill"
              width={48}
              height={48}
              alt={`${user.username}'s avatar`}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {(user?.username || "A")[0].toUpperCase()}
            </div>
          )}

          <div
            className="flex-1 bg-secondary p-4 rounded-2xl text-muted-foreground cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={() => setIsExpanded(true)}
          >
            {isExpanded ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="คุณกำลังคิดอะไรอยู่?"
                className="min-h-[80px] border-none bg-transparent focus:ring-0 resize-none p-0"
                autoFocus
              />
            ) : (
              <div>คุณกำลังคิดอะไรอยู่?</div>
            )}
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="flex justify-between items-center mt-4 rounded-lg p-2 border">
              <div className="font-medium text-foreground">
                เพิ่มเข้าในโพสต์ของคุณ
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleCreatePost}
                disabled={!content.trim() || isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    กำลังโพสต์...
                  </div>
                ) : (
                  "โพสต์"
                )}
              </Button>
            </div>
          </>
        )}

        {!isExpanded && (
          <div className="grid grid-cols-3 gap-1 mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              className="flex items-center justify-center space-x-2"
            >
              <Camera className="h-5 w-5 text-red-500" />
              <span>วิดีโอสด</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center justify-center space-x-2"
              onClick={() => setIsExpanded(true)}
            >
              <ImageIcon className="h-5 w-5 text-green-500" />
              <span>รูปภาพ</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center justify-center space-x-2"
            >
              <Smile className="h-5 w-5 text-yellow-500" />
              <span>ความรู้สึก</span>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
