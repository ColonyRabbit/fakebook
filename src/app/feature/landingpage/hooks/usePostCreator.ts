import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import postsApi from "../../../service/postsApi";
import userApi from "../../../service/usersApi";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";
import { FullUser } from "../../../type/userType";

const usePostCreator = () => {
  const { data: session, status } = useSession();
  const [content, setContent] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<FullUser>();
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
  // ฟังก์ชันเพื่อแปลง YouTube link เป็น YouTube embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|\S*?[?&]v=)|(?:youtu\.be\/))([^"&?\/\s]{11})/i
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };
  const handleCreatePost = async () => {
    setIsLoading(true);
    try {
      await postsApi.createPost(content, image, session?.user?.id).then(() => {
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
    getYouTubeEmbedUrl,
  };
};

export default usePostCreator;
