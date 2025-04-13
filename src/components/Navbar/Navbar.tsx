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
import { CiSettings } from "react-icons/ci";
import { User } from "@prisma/client";

const Navbar = () => {
  //state
  const [user, setUser] = useState<User | null>(null);
  const route = useRouter();
  const pathName = usePathname();
  const { data: session } = useSession();

  //useEffect to fetch user data
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
  }, [session?.user?.id]); // Fetch new user data when session changes

  return (
    <div className="w-full px-4 sm:px-6 py-4 bg-[#375b93] sticky top-0 z-50 shadow-lg drop-shadow-2xl">
      <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
        {/* Logo Section */}
        <div className="flex items-center">
          <Logo />
        </div>
        {/* Search Section */}
        <div className="flex justify-center">
          <Search />
        </div>

        {/* User Profile / Logout Section */}
        <div className="flex items-center justify-end gap-3">
          <div className="ml-auto flex gap-4 items-center">
            <ThemeToggle />

            {session ? (
              <>
                {/* Logout Button */}
                <Button
                  variant="default"
                  onClick={() => signOut()}
                  className="text-sm font-medium text-black hover:bg-[#4e81d7]"
                >
                  Logout
                </Button>

                {/* Profile Picture with Link */}
                {session && user && (
                  <Link
                    href={`/profile/${user.id}`}
                    className="relative inline-block"
                  >
                    <Image
                      src={user?.photoUrl || "/default-avatar.jpg"} // Use user data here
                      alt="Profile Picture"
                      width={40}
                      height={40}
                      className="rounded-full w-10 h-10 object-cover border-2 border-white"
                    />
                  </Link>
                )}

                {/* Settings Button for Profile Page */}
                {pathName === `/profile/${session.user.id}` &&
                  session.user.id && (
                    <div className="mt-2 lg:mt-0">
                      <Button
                        onClick={() =>
                          route.push(`/profile/${session.user.id}/setting`)
                        }
                        className="text-sm font-medium bg-transparent border-2 border-white hover:bg-white hover:text-[#375b93]"
                      >
                        <CiSettings size={24} />
                      </Button>
                    </div>
                  )}
              </>
            ) : (
              <>
                {/* Login Button */}
                <Button
                  variant="default"
                  onClick={() => signIn()}
                  className="text-sm font-medium text-black hover:bg-[#4e81d7]"
                >
                  Login
                </Button>

                {/* Register Button */}
                <Link href="/register">
                  <Button
                    variant="default"
                    className="text-sm font-medium text-black hover:bg-[#4e81d7]"
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
