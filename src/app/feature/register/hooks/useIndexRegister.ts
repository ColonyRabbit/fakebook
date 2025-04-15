import React, { useRef, useState } from "react";
import registerApi from "../../../service/registerApi";
import { IRequestRegisterType } from "../../../type/registerType";
import { z } from "zod";
import { useRouter } from "next/router";

const useIndexRegister = () => {
  //use Router
  const router = useRouter();
  //local state
  const [data, setData] = useState<IRequestRegisterType>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<IRequestRegisterType>>({});
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = formSchema.safeParse(data);
      if (!result.success) {
        const fieldErrors: Partial<IRequestRegisterType> = {};
        result.error.errors.forEach((err) => {
          const path = err.path[0] as keyof IRequestRegisterType;
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
      setErrors({});
      setIsLoading(true);
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);
      if (previewUrl) {
        formData.append("profileImage", previewUrl);
      }
      const response = await registerApi.registerUser(formData);
      console.log("Response from API:", response);
      router.push("/login?registered=true");
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      setGlobalError(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
      );
    } finally {
      setIsLoading(false);
    }
  };
  return {
    data,
    setData,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    errors,
    existUser,
    previewUrl,
    setPreviewUrl,
    isDragging,
    fileInputRef,
    handleSubmit,
    handleFileClick,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};

export default useIndexRegister;
