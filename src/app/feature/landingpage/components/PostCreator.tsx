"use client";

import { useState, useRef, useEffect } from "react";
import { ImageIcon, Smile, Camera } from "lucide-react";
import toast from "react-hot-toast";
import { getCurrentUser } from "../../../../../lib/auth";
import Image from "next/image";

export default function PostCreator() {
  //local state
  const [postText, setPostText] = useState<string | null>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  //get user
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userImage, setUserImage] = useState<string>("");
  useEffect(() => {
    const fetchUserId = async () => {
      const currentUser = await getCurrentUser();
      setUserId(currentUser?.id || "");
      setUserName(currentUser?.username || "");
      setUserImage(currentUser?.photo || "");
    };

    fetchUserId();
  }, []);
  // ฟังก์ชันจัดการการโพสต์
  const handleCreatePost = async () => {
    if (!postText || !postText.trim()) return;

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postText: postText,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "เข้าสู่ระบบล้มเหลว");
      }

      toast.success("โพสต์ของคุณถูกสร้างเรียบร้อยแล้ว");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }

    // รีเซ็ตฟอร์ม
    setPostText("");
    setIsExpanded(false);
  };
  if (!userId) return null; // รอให้ userId ถูกตั้งค่า
  return (
    <div className="bg-white rounded-lg w-full shadow p-4 max-w-xl mx-auto mt-4">
      <div className="flex items-center space-x-2 mb-3">
        {/* รูปโปรไฟล์ผู้ใช้ (แสดงเป็นวงกลมสีเทา) */}
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
          <Image
            className="rounded-full w-10 h-10"
            width={100}
            height={100}
            alt={userName}
            src={
              userImage ||
              "https://thumbs.dreamstime.com/b/nature-photo-freephoto-267878350.jpg"
            }
          />
        </div>

        {/* ช่องป้อนข้อความ */}
        <div
          className="bg-gray-100 rounded-full px-4 py-2.5 flex-grow text-gray-500 cursor-pointer hover:bg-gray-200"
          onClick={() => setIsExpanded(true)}
        >
          {isExpanded ? (
            <textarea
              value={postText || ""}
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
      {/* แสดงเมื่อกดที่ช่องป้อนข้อความ */}
      {isExpanded && (
        <>
          {/* ตัวเลือกเพิ่มเติม */}
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

          {/* ปุ่มโพสต์ */}
          <div className="mt-3 flex justify-end">
            <button
              className={`px-4 py-1.5 rounded-md font-medium ${
                postText?.trim() || ""
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              onClick={handleCreatePost}
              disabled={!postText?.trim() || false}
            >
              โพสต์
            </button>
          </div>
        </>
      )}
      {/* แสดงเมื่อยังไม่ได้กดที่ช่องป้อนข้อความ */}
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
