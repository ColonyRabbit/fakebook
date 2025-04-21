"use client";

import React, { useEffect, useState } from "react";
import Logo from "./Logo";
import Search from "./Search";
import ThemeToggle from "../ThemeToggle";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, LogOut, LogIn, UserPlus, Loader2, Bell } from "lucide-react";
import { User } from "@prisma/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../../../@/components/ui/skeleton";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [sennderId, setSenderId] = useState<string | null>(null);
  const route = useRouter();
  const pathName = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/users/${session.user.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) throw new Error("Failed to fetch user data");

          const data = await response.json();
          setUser(data);
        } catch (error) {
          console.error("Error fetching user:", error);
          toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง");
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel("global-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new;
          setSenderId(msg.user_id);
          if (
            msg.target_id === session.user.id &&
            msg.user_id !== session.user.id
          ) {
            setUnreadCount((prev) => prev + 1);
            setMessages((prev) => [
              ...prev,
              "จาก" + msg.username + "ส่งข้อความ: " + msg.content + " ",
            ]);
            toast(`${msg.username} ส่งข้อความ: ${msg.content}`, {
              icon: "💬",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      route.push("/");
      toast.success("ออกจากระบบสำเร็จ");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการออกจากระบบ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <nav className="w-full bg-gradient-to-r from-blue-700 to-blue-600 sticky top-0 z-50 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-3 items-center gap-6 max-sm:grid-cols-1">
          <div className="flex items-center">
            <Logo />
          </div>

          <div className="flex justify-center">
            <Search />
          </div>

          <div className="flex items-center justify-end space-x-4 max-md:justify-center">
            <ThemeToggle />

            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative p-2 hover:bg-white/10 transition-colors"
                    aria-label="การแจ้งเตือน"
                  >
                    <Bell className="w-6 h-6 text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-2">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="font-semibold">การแจ้งเตือน</span>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUnreadCount(0)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        มาร์กว่าอ่านแล้ว
                      </Button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {unreadCount > 0 ? (
                    <div className="max-h-64 overflow-auto">
                      {messages.map((message, index) => (
                        <DropdownMenuItem
                          key={index}
                          className="p-3 cursor-default"
                        >
                          <Link href={`/profile/${sennderId}`}>
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                              <p className="text-sm">{message}</p>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">ไม่มีการแจ้งเตือนใหม่</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {status === "loading" ? (
              <Skeleton className="w-10 h-10 rounded-full" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-auto w-auto rounded-full ring-offset-2 ring-offset-blue-700 focus-visible:ring-2 ring-white transition-all duration-200 hover:ring-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <Image
                        src={user?.photoUrl || "/default-avatar.jpg"}
                        alt="โปรไฟล์"
                        width={40}
                        height={40}
                        className="rounded-full w-10 h-10 object-contain"
                      />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <Link href={`/profile/${user?.id}`}>
                    <DropdownMenuItem className="p-2 cursor-pointer rounded-md">
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">{user?.username}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  {pathName === `/profile/${session.user.id}` && (
                    <DropdownMenuItem
                      onClick={() =>
                        route.push(`/profile/${session.user.id}/setting`)
                      }
                      className="p-2 cursor-pointer rounded-md"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>การตั้งค่า</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="p-2 cursor-pointer text-red-600 focus:text-red-600 rounded-md"
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    <span>ออกจากระบบ</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={handleSignIn}
                  className="text-white hover:bg-white/10 transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  เข้าสู่ระบบ
                </Button>
                <Link href="/register">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 transition-colors"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    สมัครสมาชิก
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
