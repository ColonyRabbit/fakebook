"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Bell, LogIn, LogOut, Settings, UserPlus, Loader2 } from "lucide-react";

import Logo from "./Logo";
import Search from "./Search";
import ThemeToggle from "../ThemeToggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../../../@/components/ui/skeleton";
import { User } from "@prisma/client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 👇 ชื่อ LocalStorage ที่ใช้ร่วมกันทุกที่
const STORAGE_COUNT_KEY = "unreadNotiCount";
const STORAGE_MESSAGES_KEY = "unreadNotiMessages";

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [senderId, setSenderId] = useState<string | null>(null);

  // 📦 โหลดข้อมูลจาก LocalStorage
  useEffect(() => {
    const storedCount = localStorage.getItem(STORAGE_COUNT_KEY);
    const storedMessages = localStorage.getItem(STORAGE_MESSAGES_KEY);

    if (storedCount) setUnreadCount(parseInt(storedCount));
    if (storedMessages) setMessages(JSON.parse(storedMessages));
  }, []);

  // 💾 บันทึกข้อมูลลง LocalStorage
  useEffect(() => {
    const saveToStorage = () => {
      localStorage.setItem(STORAGE_COUNT_KEY, unreadCount.toString());
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
    };

    window.addEventListener("beforeunload", saveToStorage);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") saveToStorage();
    });

    return () => {
      window.removeEventListener("beforeunload", saveToStorage);
      document.removeEventListener("visibilitychange", saveToStorage);
    };
  }, [unreadCount, messages]);

  // 🧑‍💻 โหลดข้อมูล User
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/users/${session.user.id}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [session?.user?.id]);

  // 🔔 Supabase Realtime Listener
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel("global-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;

          if (
            msg.target_id === session.user.id &&
            msg.user_id !== session.user.id
          ) {
            setSenderId(msg.user_id);

            toast(`${msg.username} ส่งข้อความ: ${msg.content}`, { icon: "💬" });

            setUnreadCount((prev) => prev + 1);
            setMessages((prev) => [
              ...prev,
              `จาก ${msg.username} ส่งข้อความ: ${msg.content}`,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  // 🚪 ออกจากระบบ
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/");
      toast.success("ออกจากระบบสำเร็จ");
    } catch {
      toast.error("เกิดข้อผิดพลาดในการออกจากระบบ");
    } finally {
      setIsSigningOut(false);
    }
  };

  // 🔘 Clear Notifications
  const clearNotifications = () => {
    setUnreadCount(0);
    setMessages([]);
    localStorage.removeItem(STORAGE_COUNT_KEY);
    localStorage.removeItem(STORAGE_MESSAGES_KEY);
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
                    className="relative p-2 hover:bg-white/10"
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
                        onClick={clearNotifications}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        มาร์กว่าอ่านแล้ว
                      </Button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {messages.length > 0 ? (
                    <div className="max-h-64 overflow-auto">
                      {messages.map((message, idx) => (
                        <DropdownMenuItem
                          key={idx}
                          className="p-2 cursor-default"
                        >
                          <Link href={`/profile/${senderId}`}>
                            <p className="text-sm">{message}</p>
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
                    ) : user?.photoUrl ? (
                      <Image
                        src={user.photoUrl}
                        alt="โปรไฟล์"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {user?.username?.charAt(0).toUpperCase() || "?"}
                      </div>
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
                  {pathname === `/profile/${session.user.id}` && (
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/profile/${session.user.id}/setting`)
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
                <Link href="/login" className="text-white hover:bg-white/10">
                  <LogIn className="h-4 w-4 mr-2" />
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
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
