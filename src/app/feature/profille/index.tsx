"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  username: string;
  email: string;
  photoUrl: string;
  followers: { id: string }[];
  following: { id: string }[];
}

const IndexProfile = ({ id }: { id: string }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // ดึงข้อมูลผู้ใช้ target ตาม id
  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${id}`, { method: "GET" });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้"
      );
    } finally {
      setLoading(false);
    }
  };

  // ดึงสถานะการติดตาม (ตรวจสอบว่าผู้ใช้ที่ล็อกอินติดตาม target user หรือไม่)
  const fetchFollower = async () => {
    if (!user?.id || !session) {
      console.log("fetchFollower: user or session is not ready");
      return;
    }
    console.log("fetchFollower: calling API for target user id:", user.id);
    try {
      const res = await fetch(`/api/follow/${user.id}?checkStatus=true`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const result = await res.json();
        console.log("result", result);
        setIsFollowing(result.alreadyFollowing);
      } else {
        const data = await res.json();
        console.error("Error checking follow status", data);
        if (data.error === "Not following") {
          setIsFollowing(false);
        }
      }
    } catch (error) {
      console.error("Error fetching follower status:", error);
    }
  };

  useEffect(() => {
    if (session && id) {
      fetchUser();
    }
  }, [session, id]);

  useEffect(() => {
    if (user?.id && session) {
      fetchFollower();
    }
  }, [user?.id, session]);

  // ฟังก์ชันติดตาม
  const handleFollow = async (targetUserId: string) => {
    try {
      const res = await fetch(`/api/follow/${targetUserId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Already following") {
          toast.error("คุณได้ติดตามผู้ใช้นี้แล้ว");
          setIsFollowing(true);
        } else {
          throw new Error(data.error || "Failed to follow user");
        }
      } else {
        toast.success("ติดตามเรียบร้อยแล้ว");
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Error following user:", err);
      toast.error(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการติดตาม"
      );
    }
  };

  // ฟังก์ชันยกเลิกติดตาม
  const handleUnfollow = async (targetId: string) => {
    try {
      const res = await fetch(`/api/unfollow/${targetId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to unfollow user");
      } else {
        toast.success("ยกเลิกติดตามเรียบร้อยแล้ว");
        setIsFollowing(false);
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
      toast.error(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการยกเลิกติดตาม"
      );
    }
  };

  if (loading) return <div className="p-4 text-center">กำลังโหลด...</div>;
  if (error)
    return (
      <div className="p-4 text-center text-red-500">
        เกิดข้อผิดพลาด: {error}
      </div>
    );
  if (!user) return <div className="p-4 text-center">ไม่พบข้อมูลผู้ใช้</div>;

  // หากไม่มี session ให้แสดงปุ่มเข้าสู่ระบบแทนปุ่มติดตาม
  if (!session) {
    return (
      <div className="p-4 text-center">
        <Button onClick={() => router.push("/login")}>เข้าสู่ระบบ</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">โปรไฟล์ผู้ใช้</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-white shadow-lg rounded-lg p-6 dark:bg-gray-800">
            {user.photoUrl && (
              <div className="flex justify-center mb-4">
                <Image
                  src={user?.photoUrl}
                  alt={user?.username}
                  width={144}
                  height={144}
                  className="rounded-full w-28 h-28 object-fit"
                />
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-semibold">{user.username}</p>
              {user.email && (
                <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              )}
            </div>
            <div className="mt-4 flex justify-around">
              <div>
                <p className="font-bold">{user.followers.length}</p>
                <p className="text-sm text-gray-500">ผู้ติดตาม</p>
              </div>
              <div>
                <p className="font-bold">{user.following.length}</p>
                <p className="text-sm text-gray-500">ติดตาม</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              {session.user.id === user.id ? (
                <div className="text-green-600 font-semibold">
                  จัดการข้อมูลของคุณ
                </div>
              ) : isFollowing ? (
                <Button
                  onClick={() => handleUnfollow(user.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  ยกเลิกติดตาม
                </Button>
              ) : (
                <Button
                  onClick={() => handleFollow(user.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  ติดตาม
                </Button>
              )}
            </div>
          </div>
        </div>
        {/* ส่วนอื่น ๆ ของโปรไฟล์ (เช่น posts, activity ฯลฯ) */}
        <div className="flex-1">
          {/* เนื้อหาฝั่งนี้สามารถเพิ่มเติมได้ตามที่ต้องการ */}
          <div className="bg-white shadow-lg rounded-lg p-6 dark:bg-gray-800">
            <p className="text-xl font-semibold">กิจกรรมของ {user?.username}</p>
            {/* เพิ่มเนื้อหาตามต้องการ */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexProfile;
