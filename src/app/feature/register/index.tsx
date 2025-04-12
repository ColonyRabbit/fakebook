"use client";
import {
  Camera,
  X,
  Upload,
  UserCircle,
  ImagePlus,
  EyeOffIcon,
  EyeIcon,
} from "lucide-react";
import Link from "next/link";

import { useRef, useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion"; // ต้องติดตั้ง framer-motion
import { RegisterType } from "../../type/registerType";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
const IndexRegister = () => {
  //use Router
  const router = useRouter();
  //local state

  const [data, setData] = useState<RegisterType>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<RegisterType>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [existUser, setExistUser] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  //zod
  const formSchema = z
    .object({
      username: z.string().min(1, { message: "กรุณากรอกชื่อผู้ใช้งาน" }),
      email: z.string().email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }),
      password: z
        .string()
        .min(8, { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }),
      confirmPassword: z
        .string()
        .min(8, { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "รหัสผ่านไม่ตรงกัน",
      path: ["confirmPassword"],
    });

  //function
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPreviewUrl(e.dataTransfer.files[0]);
    }
  };
  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ตรวจสอบข้อมูลด้วย Zod
      const result = formSchema.safeParse(data);

      if (!result.success) {
        // จัดการกับข้อผิดพลาดจาก Zod
        const fieldErrors: Partial<RegisterType> = {};
        result.error.errors.forEach((err) => {
          const path = err.path[0] as keyof RegisterType;
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      // ล้างข้อผิดพลาด
      setErrors({});

      // แสดงสถานะกำลังโหลด (ถ้าต้องการ)
      setIsLoading(true);
      let photoBase64 = null;
      if (previewUrl) {
        photoBase64 = await convertFileToBase64(previewUrl);
      }
      // ส่งข้อมูลไปยัง API
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          photo: photoBase64,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // จัดการกับข้อผิดพลาดจาก API
        setExistUser(responseData.error);
        // throw new Error(responseData.error);
      } else if (response.ok) {
        // ลงทะเบียนสำเร็จ
        console.log("ลงทะเบียนสำเร็จ:", responseData);

        // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบหรือหน้าหลัก
        router.push("/login?registered=true");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      // แสดงข้อความข้อผิดพลาด
      setGlobalError(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
      );
    } finally {
      // ปิดสถานะกำลังโหลด
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            สร้างบัญชีผู้ใช้งาน
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="w-full flex flex-col items-center space-y-6">
              <motion.div
                className="relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {previewUrl ? (
                  // แสดงรูปภาพที่เลือก
                  <motion.div
                    className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      width={160}
                      height={160}
                      src={URL.createObjectURL(previewUrl)}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay ที่แสดงเมื่อ hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end pb-4">
                      <div className="flex gap-2 mb-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="rounded-full p-2 h-auto"
                          onClick={handleFileClick}
                        >
                          <Camera size={16} />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="rounded-full p-2 h-auto"
                          onClick={() => setPreviewUrl(null)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                      <span className="text-xs text-white/90">แก้ไขรูปภาพ</span>
                    </div>
                  </motion.div>
                ) : (
                  // พื้นที่ drop zone
                  <motion.div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleFileClick}
                    className={`w-40 h-40 rounded-full border-4 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                      isDragging
                        ? "border-primary bg-primary/10"
                        : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    animate={{
                      scale: isDragging ? 1.05 : 1,
                    }}
                  >
                    <ImagePlus
                      className={`w-12 h-12 mb-2 transition-colors ${
                        isDragging
                          ? "text-primary"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-xs text-center px-2 transition-colors ${
                        isDragging
                          ? "text-primary"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {isDragging ? "วางรูปภาพที่นี่" : "คลิกหรือลากไฟล์มาวาง"}
                    </span>
                  </motion.div>
                )}

                {/* ปุ่ม X ด้านบนขวา (แสดงเมื่อมีรูปภาพ) */}
                {previewUrl && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 rounded-full w-8 h-8 shadow-md"
                      type="button"
                      onClick={() => setPreviewUrl(null)}
                    >
                      <X size={14} />
                    </Button>
                  </motion.div>
                )}
              </motion.div>

              {/* ปุ่มเลือกรูปภาพ */}
              <div className="flex flex-col items-center gap-2">
                <Button
                  type="button"
                  variant={previewUrl ? "outline" : "default"}
                  className="flex items-center gap-2 px-5 py-2 transition-all"
                  onClick={handleFileClick}
                >
                  <Upload size={16} className="animate-pulse" />
                  {previewUrl ? "เปลี่ยนรูปภาพ" : "อัปโหลดรูปภาพ"}
                </Button>

                <span className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-[250px]">
                  รองรับไฟล์ JPG, PNG หรือ GIF ขนาดไม่เกิน 5MB
                </span>
              </div>

              {/* ซ่อน input จริง */}
              <Input
                ref={fileInputRef}
                onChange={(e) => {
                  setPreviewUrl(e.target.files?.[0] || null);
                }}
                type="file"
                accept="image/*"
                id="profileImage"
                name="profileImage"
                className="hidden"
              />
            </div>
            <div>
              <Label htmlFor="username" className="block text-sm font-medium">
                Username
              </Label>
              <Input
                value={data.username}
                onChange={(e) => setData({ ...data, username: e.target.value })}
                id="username"
                name="username"
                type="text"
                className={`mt-1 ${errors.username ? "border-red-500" : ""}`}
                placeholder="your_username"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium">
                Email address
              </Label>
              <Input
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                id="email"
                name="email"
                type="email"
                className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  value={data.password}
                  onChange={(e) =>
                    setData({ ...data, password: e.target.value })
                  }
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="block text-sm font-medium"
              >
                Confirm Password
              </Label>
              <div className="relative mt-1">
                <Input
                  value={data.confirmPassword}
                  onChange={(e) =>
                    setData({ ...data, confirmPassword: e.target.value })
                  }
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`pr-10 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              required
            />
            <label
              htmlFor="terms"
              className="ml-2 block text-sm text-gray-600 dark:text-gray-400"
            >
              I agree to the
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              and
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <div>
            {existUser && <div className="text-red-500">{existUser}</div>}
            <Button type="submit" className="w-full py-6">
              Sign up
            </Button>
          </div>
        </form>

        <div className="text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default IndexRegister;
