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
  MessageCircle,
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
import usersApi from "../../service/usersApi";
import clsx from "clsx";
import { FullUser } from "../../type/userType";
import FloatingChatWrapper from "../../../components/FloatingChatWrapper";

const IndexProfile = ({ id }: { id: string }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<FullUser | any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("posts");
  useEffect(() => {
    const fetchData = async () => {
      if (!session || !id) return;
      try {
        setLoading(true);
        const userRes = await usersApi.getOneUser(id);
        setUser(userRes);

        const res = await fetch(`/api/follow/${userRes.id}`, {
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
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id, id]);

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
                className="rounded-full w-32 h-32 object-cover ring-4 ring-offset-2 ring-gray-100 dark:ring-gray-800"
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
                  ร่วมเป็นสมาชิกเมื่อ{" "}
                  {new Date(user.createdAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
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
                  onClick={() => router.push(`/profile/${user.id}/setting`)}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  แก้ไขโปรไฟล์
                </Button>
              ) : (
                <div className="flex justify-center md:justify-start gap-6 mt-4">
                  {" "}
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
                  <FloatingChatWrapper
                    session={session}
                    targetUserId={user.id}
                  />
                </div>
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
        <TabsList className="w-full justify-start dark:bg-gray-800/50 bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            โพสต์
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <UserCircle2 className="w-4 h-4" />
            เกี่ยวกับ
          </TabsTrigger>
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            ผู้ติดตาม
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6 dark:bg-gray-800/50">
          <Card className="p-8 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">โพสต์ล่าสุด</h3>
              <div className="flex gap-4 text-gray-600">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {user.posts?.length || 0} โพสต์
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {user.posts?.reduce(
                    (total: number, post: FullUser["posts"][number]) =>
                      total + (post._count.comments || 0),
                    0
                  )}
                  ความคิดเห็น
                </span>
              </div>
            </div>
            {user.posts?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">ยังไม่มีโพสต์</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card className="p-8 bg-white/50 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold mb-6">ข้อมูลผู้ใช้</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">อีเมล</p>
                <p className="text-lg">{user.email}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="followers" className="mt-6">
          <Card className="p-8 bg-white/50 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold mb-6">ผู้ติดตาม</h3>
            {user.followers?.length > 0 ? (
              <div className="grid gap-6">
                {user.followers.map((relation) => (
                  <div
                    key={relation.id}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {relation.photoUrl ? (
                      <Image
                        src={relation.photoUrl}
                        alt={relation.username}
                        width={48}
                        height={48}
                        className="rounded-full ring-2 ring-offset-2 ring-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {relation.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-lg">
                        {relation.username}
                      </p>
                      <p className="text-sm text-gray-500">{relation.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">ยังไม่มีผู้ติดตามในขณะนี้</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IndexProfile;
