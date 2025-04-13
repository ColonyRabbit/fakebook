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
import { Settings, LogOut, LogIn, UserPlus } from "lucide-react";
import { User } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const route = useRouter();
  const pathName = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      const fetchUser = async () => {
        try {
          const response = await fetch(`/api/users/${session.user.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          if (data) {
            setUser(data);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };
      fetchUser();
    }
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    await signOut();
    route.push("/");
  };

  return (
    <nav className="w-full bg-[#375b93] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="grid grid-cols-3 items-center gap-4">
          {/* Logo Section */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Search Section */}
          <div className="flex justify-center">
            <Search />
          </div>

          {/* Actions Section */}
          <div className="flex items-center justify-end space-x-4">
            <ThemeToggle />

            {session ? (
              <div className="flex items-center space-x-4">
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative w-auto h-auto rounded-full"
                    >
                      <Image
                        src={user?.photoUrl || "/default-avatar.jpg"}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="rounded-full object-contain  w-12 h-12 border-2 border-white hover:border-opacity-75 transition-all"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <Link href={`/profile/${user?.id}`}>
                      <DropdownMenuItem className="cursor-pointer">
                        <div className="flex flex-col space-y-1">
                          <p className="font-medium">{user?.username}</p>
                          <p className="text-xs text-muted-foreground">
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
                        className="cursor-pointer"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>การตั้งค่า</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>ออกจากระบบ</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => signIn()}
                  className="text-white hover:bg-white/20"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  เข้าสู่ระบบ
                </Button>
                <Link href="/register">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20"
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
