"use client";
import React from "react";
import Logo from "./Logo";
import Search from "./Search";
import ThemeToggle from "../ThemeToggle";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CiSettings } from "react-icons/ci";

const Navbar = () => {
  //useRuter
  const route = useRouter();
  //usePathName
  const pathName = usePathname();
  console.log(pathName);
  const { data: session } = useSession();
  return (
    <div className="w-full px-6 py-4 shadow-sm bg-white dark:bg-[#375b93] sticky top-0 z-50 drop-shadow-2xl">
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
            <div className="ml-auto flex gap-4 items-center">
              <Button
                variant="default"
                onClick={() => signOut()}
                className="text-sm font-medium"
              >
                Logout
              </Button>
              {session.user.photoUrl && (
                <Link
                  href={`/profile/${session.user.id}`}
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
              {pathName === `/profile/${session.user.id}` &&
                session.user.id && (
                  <div className="flex-1 mt-6 lg:mt-0">
                    <Button
                      onClick={() =>
                        route.push(`/profile/${session.user.id}/setting`)
                      }
                    >
                      <CiSettings />
                    </Button>
                  </div>
                )}
            </div>
          ) : (
            <>
              <Button
                variant="default"
                onClick={() => signIn()}
                className="text-sm font-medium "
              >
                <span className="">Login</span>
              </Button>
              {!session && (
                <Link href="/register">
                  <Button variant="default" className="text-sm font-medium ">
                    <span className="">Register</span>
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
