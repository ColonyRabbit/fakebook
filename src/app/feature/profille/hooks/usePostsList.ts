import { useEffect, useState, useCallback, useRef } from "react";
import postsApi from "../../../service/postsApi";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const LIMIT = 2;

const usePostsList = () => {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [editedImage, setEditedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [likeInProgress, setLikeInProgress] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<{
    [postId: string]: boolean;
  }>({});

  const observerRef = useRef<HTMLDivElement | null>(null);

  // ✅ ใช้ IntersectionObserver สำหรับ infinite scroll
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setPage((prev) => prev + 1);
          setLoadingMore(true);
        }
      },
      { rootMargin: "200px" }
    );

    const current = observerRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, loadingMore]);

  // ✅ toggle คอมเมนต์
  const handleShowComments = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // ✅ แก้ไขโพสต์
  const handleEdit = (postId: string, content: string) => {
    setEditingPostId(postId);
    setEditedContent(content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedContent("");
    setEditedImage(null);
  };

  const handleSubmitEdit = async (postId: string) => {
    const formData = new FormData();
    formData.append("postId", postId);
    formData.append("content", editedContent);
    if (editedImage) formData.append("file", editedImage);

    try {
      const res = await fetch("/api/posts", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "แก้ไขโพสต์ไม่สำเร็จ");

      setPosts((prev) =>
        prev.map((p) => (p.id === data.post.id ? data.post : p))
      );
      toast.success("แก้ไขโพสต์เรียบร้อย");
      handleCancelEdit();
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการแก้ไข");
    }
  };
  const fetchMorePosts = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  };
  const handleDelete = async (postId: string) => {
    try {
      await postsApi.deleteOnePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      toast.success("ลบโพสต์เรียบร้อย");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    posts,
    error,
    loadingMore,
    likeInProgress,
    editingPostId,
    editedContent,
    expandedComments,
    handleDelete,
    handleEdit,
    handleCancelEdit,
    handleShowComments,
    setEditedContent,
    session,
    setPosts,
    fileInputRef,
    setEditedImage,
    editedImage,
    handleSubmitEdit,
    setLikeInProgress,
    hasMore,
    observerRef,
    fetchMorePosts,
    page,
    LIMIT,
    setHasMore,
    setError,
    setInitialLoading,
    setLoadingMore,
  };
};

export default usePostsList;
