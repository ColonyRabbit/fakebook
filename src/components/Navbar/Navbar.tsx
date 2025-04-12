import React from "react";
import Logo from "./Logo";
import Search from "./Search";
import ThemeToggle from "../ThemeToggle";
import { cookies } from "next/headers";
import Logout from "./Logout";
import { getCurrentUser } from "../../../lib/auth";
import Link from "next/link";

const Navbar = async () => {
  // ตรวจสอบสถานะการล็อกอินจาก server
  const hasauthToken = !!(await cookies()).get("authToken")?.value;
  const user = await getCurrentUser();
  // console.log("authToken", user);
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
          <Logout isLoggedIn={hasauthToken} />
          {user ? (
            <Link
              href={`/profile/${user!.username}`}
              className="flex items-center gap-2"
            >
              <h1>{user!.username}</h1>
            </Link>
          ) : (
            <Link href="/login">เข้าสู่ระบบ</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
