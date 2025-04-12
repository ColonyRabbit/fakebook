// app/profile/[username]/IndexProfile.tsx (Client Component)
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { getCurrentUser } from "../../../../lib/auth";
export interface User {
  username: string;
  id: string;
  photo: string | null;
  email: string | null;
}
const IndexProfile = ({ username }: { username: string }) => {
  //Current user

  //local
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/${username}`, { method: "GET" });
        const currentUser = await getCurrentUser();
        setCurrentUser(currentUser);
        console.log("Current user:", currentUser);
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้"
        );
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username]);

  if (loading) return <div>กำลังโหลด...</div>;
  if (error) return <div>เกิดข้อผิดพลาด: {error}</div>;
  if (!user) return <div>ไม่พบข้อมูลผู้ใช้</div>;
  //funtion
  const handleFollow = async (targetId: string) => {
    try {
      const res = await fetch(`/api/follow/${targetId}`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to follow user");
      }

      setIsFollowing(true);
      console.log("Followed user successfully");
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">โปรไฟล์ผู้ใช้</h1>
      {currentUser.id === user.id ? (
        <div className="mb-4 text-green-500">จัดการข้อมูลของคุณ</div>
      ) : isFollowing ? (
        <div className="text-blue-600">คุณติดตามแล้ว</div>
      ) : (
        <Button onClick={() => handleFollow(user.id)}>ติดตาม</Button>
      )}
      <div className="bg-white shadow rounded-lg p-6 dark:text-black">
        <div className="mb-4">
          <strong>ชื่อผู้ใช้:</strong> {user.username}
        </div>
        {user.username && (
          <div className="mb-4">
            <strong>ชื่อ:</strong> {user.username}
          </div>
        )}
        {user.email && (
          <div className="mb-4">
            <strong>อีเมล:</strong> {user.email}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexProfile;
