"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export interface User {
  username: string;
  id: string;
  photoUrl: string | null;
  email: string | null;
}

const IndexProfile = ({ username }: { username: string }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${username}`, {
        method: "GET",
      });
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
    if (session) {
      fetchUser();
    }
  }, [session, username]);

  const handleFollow = async (targetId: string) => {
    try {
      const res = await fetch(`/api/follow/${targetId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to follow user");
      setIsFollowing(true);
    } catch (err) {
      console.error("Error following user:", err);
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
        <div className="text-blue-600">คุณติดตามแล้ว</div>
      ) : (
        <Button onClick={() => handleFollow(user.id)}>ติดตาม</Button>
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
