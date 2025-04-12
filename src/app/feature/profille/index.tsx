"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";

export interface User {
  username: string;
  id: string;
  photoUrl: string | null;
  email: string | null;
}

const IndexProfile = ({ username }: { username: string }) => {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${username}`, { method: "GET" });
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

  useEffect(() => {
    const fetchFollower = async () => {
      if (!user?.id) return; // ตรวจสอบว่า user.id มีค่าหรือไม่
      const res = await fetch(`/api/follow/${user.id}`, { method: "POST" });
      if (res.ok) {
        const result = await res.json();
        setIsFollowing(result.alreadyFollowing);
      }
    };
    fetchUser();
    fetchFollower();
  }, [session, username, user?.id]);

  const handleFollow = async (targetId: string) => {
    try {
      const res = await fetch(`/api/follow/${targetId}`, {
        method: "POST",
        credentials: "include", // ตรวจสอบว่า cookie ส่งไปด้วยหรือไม่
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

  if (loading) return <div>กำลังโหลด...</div>;
  if (error) return <div>เกิดข้อผิดพลาด: {error}</div>;
  if (!user) return <div>ไม่พบข้อมูลผู้ใช้</div>;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">โปรไฟล์ผู้ใช้</h1>
      {session?.user?.id === user.id ? (
        <div className="mb-4 text-green-500">จัดการข้อมูลของคุณ</div>
      ) : isFollowing ? (
        <Button disabled={!session?.accessToken} className="text-blue-600">
          ยกเลิกติดตาม
        </Button>
      ) : (
        <Button
          disabled={!session?.accessToken}
          onClick={() => handleFollow(user.id)}
        >
          ติดตาม
        </Button>
      )}
      <div className="bg-white shadow rounded-lg p-6 dark:text-black">
        {user.photoUrl && (
          <div className="mb-4">
            <Image
              src={user.photoUrl}
              alt={user.username}
              width={100}
              height={100}
              className="rounded-full w-36 h-36"
            />
          </div>
        )}
        <div className="mb-4">
          <strong>ชื่อผู้ใช้:</strong> {user.username}
        </div>
        {user.email && (
          <div className="mb-4">
            <strong>อีเมล:</strong> {user.email}
          </div>
        )}
      </div>
      {session ? null : (
        <div className="text-center text-sm mt-4">
          <p>
            มีบัญชีหรือยัง?{" "}
            <Link href="/login" className="text-blue-600 font-medium">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default IndexProfile;
