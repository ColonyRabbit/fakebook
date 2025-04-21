import { useEffect, useState, useCallback, useRef } from "react";
import postsApi from "../../../service/postsApi";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { Post } from "../../../type/postType";

const useFeed = () => {
  const LIMIT = 2;
  const { data: session } = useSession();

  // ✅ STATE MANAGEMENT
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);

  const [posts, setPosts] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [likeInProgress, setLikeInProgress] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");

  const [expandedComments, setExpandedComments] = useState<{
    [postId: string]: boolean;
  }>({});

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ✅ FETCH POSTS
  const fetchPosts = useCallback(async () => {
    try {
      const response = await postsApi.getAllPosts(page, LIMIT);

      setPosts((prev) => [...prev, ...response.posts]);
      setHasMore(response.pagination.hasMore);
    } catch (err) {
      console.error(err);
      setError("Could not load posts");
    } finally {
      if (page === 1) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [page]);

  useEffect(() => {
    fetchPosts();
    console.log("posts>>>", posts);
  }, [fetchPosts]);

  // ✅ LOAD MORE (INFINITE SCROLL)
  const fetchMorePosts = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  // ✅ COMMENT TOGGLE
  const handleShowComments = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // ✅ POST EDITING
  const handleEdit = (postId: string, currentContent: string) => {
    setEditingPostId(postId);
    setEditedContent(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedContent("");
  };
  const handleSubmitEdit = async (postId: string) => {
    const formData = new FormData();
    formData.append("postId", postId);
    formData.append("content", editedContent);
    if (editedImage) {
      formData.append("file", editedImage);
    }

    try {
      const res = await fetch("/api/posts", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setPosts((prev) =>
        prev.map((p) => (p.id === data.post.id ? data.post : p))
      );

      setEditedContent("");
      setEditedImage(null);
      handleCancelEdit();
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถแก้ไขโพสต์ได้");
    }
  };
  const handleSaveEdit = async (postId: string) => {
    try {
      await postsApi.updateOnePost(editedContent, postId);
      toast.success("Post updated successfully");

      setEditingPostId(null);
      setEditedContent("");

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, content: editedContent } : post
        )
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // ✅ DELETE POST
  const handleDelete = async (postId: string) => {
    try {
      await postsApi.deleteOnePost(postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      toast.success("Post deleted successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // ✅ EXPORT EVERYTHING
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
    handleSaveEdit,
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
    fetchMorePosts,
    hasMore,
  };
};

export default useFeed;
