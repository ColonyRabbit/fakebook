import React, { useEffect, useState } from "react";
import postsApi from "../../../service/postsApi";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { Post } from "../../../type/postType";

const useFeed = () => {
  //call session
  const { data: session } = useSession();
  //local state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likeInProgress, setLikeInProgress] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [expandedComments, setExpandedComments] = useState<{
    [postId: string]: boolean;
  }>({});
  //function
  const handleShowComments = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };
  const handleEdit = (postId: string, currentContent: string) => {
    setEditingPostId(postId);
    setEditedContent(currentContent);
  };
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedContent("");
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
  const handleDelete = async (postId: string) => {
    try {
      await postsApi.deleteOnePost(postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      toast.success("Post deleted successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  //useEffect
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await postsApi.getAllPosts();

        setPosts(response.posts);
      } catch (err) {
        console.error(err);
        setError("Could not load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);
  return {
    posts,
    loading,
    error,
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
    setLikeInProgress,
  };
};

export default useFeed;
