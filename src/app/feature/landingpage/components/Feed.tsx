"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Share2,
  ThumbsUp,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import Allcomments from "./Allcomments";
import ButtonLike from "./ButtonLike";
import useFeed from "../hooks/useFeed";

const Feed = () => {
  //call hooks
  const {
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
    setLikeInProgress,
    fetchMorePosts,
    hasMore,
  } = useFeed();
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMorePosts();
        }
      },
      { rootMargin: "200px" }
    );

    const current = observerRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [fetchMorePosts, hasMore]);

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
        {posts?.length === 0 && !loadingMore && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts yet</p>
          </div>
        )}

        {posts?.map((post, index) => {
          const isLast = index === posts.length - 1;

          return (
            <div
              key={index}
              ref={isLast ? observerRef : null}
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
                      <span>Comment {post?.comments}</span>
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
          );
        })}
        {loadingMore && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
