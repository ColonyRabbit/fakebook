"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2, Camera } from "lucide-react";
import { User } from "@prisma/client";
import Image from "next/image";
import { Button } from "../../../../components/ui/button";

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const strength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(4, Math.floor(score / 1.5));
  }, [password]);

  const getColorClass = () => {
    switch (strength) {
      case 0:
        return "bg-red-500";
      case 1:
        return "bg-orange-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-blue-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 0:
        return "อ่อนมาก";
      case 1:
        return "อ่อน";
      case 2:
        return "ปานกลาง";
      case 3:
        return "ดี";
      case 4:
        return "แข็งแรง";
      default:
        return "";
    }
  };

  return (
    <div className="mt-2 space-y-1">
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getColorClass()}`}
          style={{ width: `${(strength / 4) * 100}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          ความปลอดภัย: {getStrengthText()}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {strength < 3 && "ควรมีตัวพิมพ์ใหญ่, ตัวเลข และอักขระพิเศษ"}
        </span>
      </div>
    </div>
  );
};

const ProfileSettings = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<File | string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    if (session?.user) {
      setUsername(session.user.name || "");
      setEmail(session.user.email || "");
      fetchUser();
    }
  }, [session]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${id}`, { method: "GET" });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setUser(data);
    } catch (err) {
      toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImagePreview(e.target.files[0]);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username) {
      toast.error("กรุณากรอกชื่อผู้ใช้");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("userId", session?.user.id || "");
      formData.append("username", username);
      formData.append("email", session?.user.email || "");

      if (imagePreview) {
        formData.append("profileImage", imagePreview);
      } else if (user?.photoUrl) {
        formData.append("profileImage", session?.user.photoUrl);
      }

      if (password) {
        formData.append("password", password);
      }

      const res = await fetch("/api/register", {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      }

      toast.success("ข้อมูลอัปเดตเรียบร้อยแล้ว");
      router.push(`/profile/${user?.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
            กำลังโหลด...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-10 rounded-t-2xl">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-3xl font-bold text-white text-center">
              ตั้งค่าโปรไฟล์
            </h1>

            <div className="relative group">
              <div className="relative h-32 w-32">
                <Image
                  src={
                    imagePreview instanceof File
                      ? URL.createObjectURL(imagePreview)
                      : user?.photoUrl || "/image/freephoto.jpg"
                  }
                  alt="Profile Picture"
                  width={128}
                  height={128}
                  className="rounded-full object-cover h-32 w-32 ring-4 ring-white/30 transition-all duration-300 group-hover:ring-white/60 shadow-xl items-center justify-center"
                />
                <div className="absolute inset-0 bg-black/0 rounded-full group-hover:bg-black/20 transition-all duration-300"></div>
                <label
                  htmlFor="photo"
                  className="absolute bottom-1 right-1 bg-white p-2.5 rounded-full cursor-pointer hover:bg-gray-100 transition-all duration-200 shadow-md transform group-hover:scale-110"
                >
                  <Camera className="h-5 w-5 text-blue-600" />
                  <input
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-white/80 text-center mt-3 font-medium">
                คลิกที่ไอคอนกล้องเพื่ออัพโหลดรูปภาพ
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveChanges} className="px-8 py-8 space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ชื่อผู้ใช้
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  focused === "username" ? "transform -translate-y-1" : ""
                }`}
              >
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocused("username")}
                  onBlur={() => setFocused(null)}
                  className="block w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="กรอกชื่อผู้ใช้"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="block w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-lg
                         bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                รหัสผ่านใหม่
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  focused === "password" ? "transform -translate-y-1" : ""
                }`}
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="block w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
                />
              </div>
              {password && <PasswordStrengthIndicator password={password} />}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ยืนยันรหัสผ่าน
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  focused === "confirmPassword"
                    ? "transform -translate-y-1"
                    : ""
                }`}
              >
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocused("confirmPassword")}
                  onBlur={() => setFocused(null)}
                  className={`block w-full px-4 py-3.5 border rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           ${
                             password &&
                             confirmPassword &&
                             password !== confirmPassword
                               ? "border-red-300 dark:border-red-700"
                               : "border-gray-200 dark:border-gray-700"
                           }`}
                  placeholder="ยืนยันรหัสผ่านใหม่"
                />
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-500 mt-1">รหัสผ่านไม่ตรงกัน</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>กำลังบันทึก...</span>
                </div>
              ) : (
                "บันทึกการเปลี่ยนแปลง"
              )}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 
                       text-gray-700 dark:text-gray-300 py-3.5 rounded-lg font-medium 
                       transition-all duration-200 hover:shadow-md"
              disabled={loading}
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      </div>

      <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
        <p>จัดการโปรไฟล์ส่วนตัวของคุณ • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default ProfileSettings;
