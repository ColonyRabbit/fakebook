// components/PostCreator.tsx (หรือในที่ที่คุณเก็บ component นี้)
"use client";

import { useState, useRef } from "react";
import { ImageIcon, Smile, Camera } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function PostCreator() {
  const { data: session, status } = useSession();

  const [postText, setPostText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCreatePost = async () => {
    if (!postText.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postText: postText,
          userId: session?.user.id, // ใช้ user id จาก session
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "การสร้างโพสต์ล้มเหลว");
      }

      toast.success("โพสต์ของคุณถูกสร้างเรียบร้อยแล้ว");
      setPostText("");
      setIsExpanded(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
    setIsLoading(false);
  };

  // รอให้ข้อมูล session ถูกโหลด
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>โปรดเข้าสู่ระบบเพื่อสร้างโพสต์</div>;

  return (
    <div className="bg-white rounded-lg w-full shadow p-4 max-w-xl mx-auto mt-4">
      <div className="flex items-center space-x-2 mb-3">
        {/* รูปโปรไฟล์ผู้ใช้ */}
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
          {session.user.photoUrl ? (
            <Image
              src={session.user.photoUrl}
              className="rounded-full w-10 h-10"
              width={40}
              height={40}
              alt={`${session.user.name}'s avatar`}
            />
          ) : (
            // แสดง placeholder ถ้าไม่มีรูป
            <div className="w-10 h-10 rounded-full bg-gray-400" />
          )}
        </div>
        {/* ช่องป้อนข้อความ */}
        <div
          className="bg-gray-100 rounded-full px-4 py-2.5 flex-grow text-gray-500 cursor-pointer hover:bg-gray-200"
          onClick={() => setIsExpanded(true)}
        >
          {isExpanded ? (
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="คุณกำลังคิดอะไรอยู่?"
              className="w-full bg-transparent border-none focus:outline-none resize-none"
              rows={3}
              autoFocus
            />
          ) : (
            <div>คุณกำลังคิดอะไรอยู่?</div>
          )}
        </div>
      </div>
      {/* ส่วนเพิ่มเติมเมื่อเปิดช่องโพสต์ */}
      {isExpanded && (
        <>
          <div className="flex justify-between items-center mt-3 border rounded-lg p-2">
            <div className="font-medium">เพิ่มเข้าในโพสต์ของคุณ</div>
            <div className="flex space-x-2">
              <button
                className="p-2 rounded-full hover:bg-gray-100 text-green-500"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
              >
                <ImageIcon size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*"
              />
              <button className="p-2 rounded-full hover:bg-gray-100 text-yellow-500">
                <Smile size={20} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              className={`px-4 py-1.5 rounded-md font-medium ${
                postText.trim()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              onClick={handleCreatePost}
              disabled={!postText.trim() || isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "โพสต์"
              )}
            </button>
          </div>
        </>
      )}
      {!isExpanded && (
        <div className="border-t mt-3 pt-3 grid grid-cols-3 gap-1">
          <button className="flex items-center justify-center py-1.5 rounded-md hover:bg-gray-100">
            <Camera size={20} className="text-red-500 mr-2" />
            <span className="font-medium">วิดีโอสด</span>
          </button>
          <button
            className="flex items-center justify-center py-1.5 rounded-md hover:bg-gray-100"
            onClick={() => setIsExpanded(true)}
          >
            <ImageIcon size={20} className="text-green-500 mr-2" />
            <span className="font-medium">รูปภาพ</span>
          </button>
          <button className="flex items-center justify-center py-1.5 rounded-md hover:bg-gray-100">
            <Smile size={20} className="text-yellow-500 mr-2" />
            <span className="font-medium">ความรู้สึก</span>
          </button>
        </div>
      )}
    </div>
  );
}
