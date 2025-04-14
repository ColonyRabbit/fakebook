"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "../../../../components/ui/button";
import { User } from "@prisma/client";
import { Camera, Loader2 } from "lucide-react";

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
          <h1 className="text-3xl font-bold text-white text-center">
            ตั้งค่าโปรไฟล์
          </h1>
        </div>

        <form onSubmit={handleSaveChanges} className="px-8 py-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Image
                key={user?.photoUrl}
                src={
                  imagePreview instanceof File
                    ? URL.createObjectURL(imagePreview)
                    : user?.photoUrl || "/image/freephoto.jpg"
                }
                alt="Profile Picture"
                width={120}
                height={120}
                className="rounded-full object-cover ring-4 ring-blue-100"
              />
              <label
                htmlFor="photo"
                className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
              >
                <Camera className="h-5 w-5 text-white" />
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
            <p className="text-sm text-gray-500">
              คลิกที่ไอคอนกล้องเพื่ออัพโหลดรูปภาพ
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="กรอกชื่อผู้ใช้"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                รหัสผ่านใหม่
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ยืนยันรหัสผ่าน
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="ยืนยันรหัสผ่านใหม่"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  กำลังบันทึก...
                </div>
              ) : (
                "บันทึกการเปลี่ยนแปลง"
              )}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
