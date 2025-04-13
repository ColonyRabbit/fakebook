"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "../../../../components/ui/button";

const ProfileSettings = () => {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      setUsername(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

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
      formData.append("username", username);
      formData.append("email", email);
      if (password) formData.append("password", password);
      if (imagePreview) formData.append("photo", imagePreview);

      const res = await fetch("/api/update-profile", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      }

      toast.success("ข้อมูลอัปเดตเรียบร้อยแล้ว");
      router.push("/profile");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading")
    return <p className="text-center">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-md">
      <h1 className="text-2xl font-semibold mb-6">การตั้งค่าบัญชีผู้ใช้</h1>

      <form onSubmit={handleSaveChanges} encType="multipart/form-data">
        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          <Image
            key={session?.user?.photoUrl}
            src={
              imagePreview instanceof File
                ? URL.createObjectURL(imagePreview)
                : session?.user?.photoUrl || "/default-avatar.jpg"
            }
            alt="Profile Picture"
            width={100}
            height={100}
            className="rounded-full w-28 h-28 object-cover"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="photo"
            className="block text-sm font-medium text-gray-700"
          >
            อัปโหลดภาพโปรไฟล์ใหม่
          </label>
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500"
          />
        </div>

        {/* Username */}
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            ชื่อผู้ใช้
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            อีเมล
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            disabled
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            รหัสผ่านใหม่
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            ยืนยันรหัสผ่าน
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="ยืนยันรหัสผ่านใหม่"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        {/* Save Button */}
        <div className="justify-center grid grid-cols-2 gap-2">
          <Button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
          <Button
            onClick={() => router.back()}
            type="button"
            className="bg-red-600 text-white py-2 px-6 rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={loading}
          >
            ยกเลิก
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
