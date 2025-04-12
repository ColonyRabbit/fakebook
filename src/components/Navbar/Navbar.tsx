"use client";
import React from "react";
import Logo from "./Logo";
import Search from "./Search";
import ThemeToggle from "../ThemeToggle";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";

const Navbar = () => {
  const { data: session } = useSession();
  console.log("Session data:", session); // สำหรับดีบัก
  return (
    <div className="w-full px-6 py-4 shadow-sm bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
        <div className="flex items-center">
          <Logo />
        </div>

        <div className="flex justify-center">
          <Search />
        </div>

        <div className="flex items-center justify-end gap-3">
          <ThemeToggle />
          {session ? (
            <>
              <Button
                onClick={() => signOut()}
                className="text-sm font-medium dark:text-gray-200 hover:underline"
              >
                Logout
              </Button>
              {session.user.photoUrl && (
                <Link
                  href={`/profile/${session.user.name}`}
                  className="relative inline-block"
                >
                  <Image
                    src={session.user.photoUrl}
                    alt="Profile Picture"
                    width={40}
                    height={40}
                    className="rounded-full w-10 h-10 "
                  />
                </Link>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={() => signIn()}
                className="text-sm font-medium  dark:text-gray-200 hover:underline"
              >
                <span className="sr-only">Login</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
