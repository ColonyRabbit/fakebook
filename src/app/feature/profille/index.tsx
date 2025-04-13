"use client";

import React, { useEffect, useState } from "react";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  UserCircle2,
  Users,
  Activity,
  Settings,
  Mail,
  Link as LinkIcon,
} from "lucide-react";
import { Card } from "../../../../@/components/ui/card";
import ProfileSkeleton from "./components/ProfileSkeleton";
import { Button } from "../../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../@/components/ui/tabs";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("posts");

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

  const fetchFollower = async () => {
    if (!user?.id || !session) return;
    try {
      const res = await fetch(`/api/follow/${user.id}?checkStatus=true`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const result = await res.json();
        setIsFollowing(result.alreadyFollowing);
      } else {
        const data = await res.json();
        if (data.error === "Not following") {
          setIsFollowing(false);
        }
      }
    } catch (error) {
      console.error("Error fetching follower status:", error);
    }
  };

  useEffect(() => {
    if (session && id) fetchUser();
  }, [session, id]);

  useEffect(() => {
    if (user?.id && session) fetchFollower();
  }, [user?.id, session]);

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

  if (!session) {
    return (
      <Card className="max-w-md mx-auto mt-20 p-6 text-center">
        <UserCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-4">
          เข้าสู่ระบบเพื่อดูโปรไฟล์
        </h2>
        <Button onClick={() => router.push("/login")} className="w-full">
          เข้าสู่ระบบ
        </Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto mt-8 p-8">
        <ProfileSkeleton />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8 p-6 border-red-200 bg-red-50">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">เกิดข้อผิดพลาด</p>
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-8 p-6">
        <div className="text-center text-gray-600">
          <UserCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">ไม่พบข้อมูลผู้ใช้</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            {user.photoUrl ? (
              <Image
                src={user.photoUrl}
                alt={user.username}
                width={128}
                height={128}
                className="rounded-full ring-4 ring-offset-2 ring-gray-100 dark:ring-gray-800"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {user.username[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-grow text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">{user.username}</h1>
            <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
              <div className="flex items-center text-muted-foreground">
                <Mail className="w-4 h-4 mr-2" />
                {user.email}
              </div>
              <div className="flex items-center text-muted-foreground">
                <LinkIcon className="w-4 h-4 mr-2" />
                <span>
                  ร่วมเป็นสมาชิกเมื่อ {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex justify-center md:justify-start gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{user.followers.length}</p>
                <p className="text-sm text-muted-foreground">ผู้ติดตาม</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{user.following.length}</p>
                <p className="text-sm text-muted-foreground">กำลังติดตาม</p>
              </div>
            </div>

            <div className="mt-6">
              {session.user.id === user.id ? (
                <Button
                  onClick={() => router.push(`/profile/${user?.id}/setting`)}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  แก้ไขโปรไฟล์
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    isFollowing
                      ? handleUnfollow(user.id)
                      : handleFollow(user.id)
                  }
                  variant={isFollowing ? "outline" : "default"}
                  className="w-full md:w-auto"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {isFollowing ? "ยกเลิกการติดตาม" : "ติดตาม"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Tabs
        defaultValue="posts"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full justify-start">
          <TabsTrigger value="posts" className="flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            โพสต์
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center">
            <UserCircle2 className="w-4 h-4 mr-2" />
            เกี่ยวกับ
          </TabsTrigger>
          <TabsTrigger value="followers" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            ผู้ติดตาม
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">โพสต์ล่าสุด</h3>
            <p className="text-muted-foreground text-center py-8">
              ยังไม่มีโพสต์ในขณะนี้
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="about" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">ข้อมูลผู้ใช้</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">อีเมล</p>
                <p>{user.email}</p>
              </div>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="followers" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">ผู้ติดตาม</h3>
            <p className="text-muted-foreground text-center py-8">
              ยังไม่มีผู้ติดตามในขณะนี้
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IndexProfile;
