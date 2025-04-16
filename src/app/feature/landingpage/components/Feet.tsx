"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  MessageSquare,
  Share2,
  ThumbsUp,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "../../../../components/ui/button";
import Allcomments from "./Allcomments";
import { IResIResponsePostsType } from "../../../type/postType";
import ButtonLike from "./ButtonLike";

const Feet = () => {
  const { data: session } = useSession();
  console.log("session>>>", session);

  const [posts, setPosts] = useState<IResIResponsePostsType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likeInProgress, setLikeInProgress] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [expandedComments, setExpandedComments] = useState<{
    [postId: string]: boolean;
  }>({});

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
      const response = await fetch(`/api/posts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent, postId }),
      });
      if (!response.ok) throw new Error("Failed to update post");
      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === updatedPost.id ? updatedPost : post
        )
      );
      toast.success("Post updated successfully");
      setEditingPostId(null);
      setEditedContent("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (!response.ok) throw new Error("Failed to delete post");
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      toast.success("Post deleted successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const url = session?.user?.id
          ? `/api/posts?userId=${session.user.id}`
          : `/api/posts`;

        const response = await fetch(url, { method: "GET" });
        if (!response.ok) throw new Error("Failed to fetch posts");

        const data = await response.json();
        console.log("Fetched posts:", data);
        setPosts(data.posts);
      } catch (err) {
        console.error(err);
        setError("Could not load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b">
        Feed
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {posts?.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts yet</p>
          </div>
        )}

        {posts?.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Link href={`/profile/${post.user?.id}`}>
                  <div className="flex items-center gap-3 cursor-pointer">
                    {post.user?.photoUrl ? (
                      <Image
                        src={post.user.photoUrl}
                        alt={post.user?.username}
                        width={48}
                        height={48}
                        className="rounded-full w-12 h-12 object-fill"
                      />
                    ) : (
                      <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center">
                        <span className="text-gray-500 text-lg font-bold">
                          {post.user?.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <p className="font-semibold text-gray-900">
                      {post.user?.username || "Anonymous"}
                    </p>
                  </div>
                </Link>
                <span className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              {editingPostId === post.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleSaveEdit(post.id)} size="sm">
                      Save
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="ghost"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  {session?.user?.id === post.user?.id && (
                    <div className="flex gap-2 mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(post.id, post.content)}
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}

              {session && (
                <div className="flex items-center gap-6 pt-4 border-t my-6">
                  <ButtonLike
                    post={post}
                    session={session}
                    likeInProgress={likeInProgress}
                    setLikeInProgress={setLikeInProgress}
                    setPosts={setPosts}
                  />
                  <button
                    onClick={() => handleShowComments(post.id)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              )}

              {expandedComments[post.id] && <Allcomments postId={post.id} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feet;
