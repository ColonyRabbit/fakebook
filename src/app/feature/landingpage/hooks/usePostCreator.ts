import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import postsApi from "../../../service/postsApi";
import userApi from "../../../service/usersApi";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";

const usePostCreator = () => {
  const { data: session, status } = useSession();
  const [content, setContent] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<User>();
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchUser = async () => {
        try {
          const data = await userApi.getOneUser(session.user.id);
          if (data) {
            setUser(data);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };
      fetchUser();
    }
  }, [session?.user?.id]);

  const handleCreatePost = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    try {
      await postsApi
        .createPost(content, image, session?.user?.id)
        .then((res) => {
          toast.success("โพสต์ของคุณถูกสร้างเรียบร้อยแล้ว");
          setContent("");
          setIsExpanded(false);
        });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
    setIsLoading(false);
  };
  return {
    content,
    setContent,
    isExpanded,
    setIsExpanded,
    isLoading,
    setIsLoading,
    fileInputRef,
    user,
    handleCreatePost,
    session,
    image,
    setImage,
  };
};

export default usePostCreator;
