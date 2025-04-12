"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface LogoutProps {
  isLoggedIn?: boolean;
}

const Logout = ({ isLoggedIn }: LogoutProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        toast.success("ออกจากระบบสำเร็จ");
        router.push("/");
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาดในการออกจากระบบ");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  };

  if (isLoggedIn) {
    return (
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        className="font-medium"
      >
        Logout
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="font-medium">
        <Link href="/login" className="px-2">
          Login
        </Link>
      </Button>
      <Button size="sm" className="font-medium">
        <Link href="/register" className="px-2">
          Register
        </Link>
      </Button>
    </div>
  );
};

export default Logout;
