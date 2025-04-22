"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Share2,
  ThumbsUp,
  Loader2,
  Pencil,
  Trash2,
  ImagePlus,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import Allcomments from "./Allcomments";
import ButtonLike from "./ButtonLike";
import useFeed from "../hooks/useFeed";

const Feed = () => {
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
    fileInputRef,
    setEditedImage,
    editedImage,
    handleSubmitEdit,
    setLikeInProgress,
    fetchMorePosts,
    hasMore,
    getYouTubeEmbedUrl,
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
    <div className="max-w-2xl mx-auto p-4 sm:p-6 w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
        Feed
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-fade-in">
          <p className="text-red-600 text-center font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-8">
        {posts?.length === 0 && !loadingMore && (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500 text-lg font-medium">No posts yet</p>
            <p className="text-gray-400 mt-2">
              Be the first to share something!
            </p>
          </div>
        )}

        {posts?.map((post, index) => {
          const isLast = index === posts.length - 1;

          return (
            <div
              key={index}
              ref={isLast ? observerRef : null}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <Link href={`/profile/${post.user?.id}`}>
                    <div className="flex items-center gap-3 group cursor-pointer">
                      {post.user?.photoUrl ? (
                        <Image
                          src={post.user.photoUrl}
                          alt={post.user?.username}
                          width={48}
                          height={48}
                          className="rounded-full w-12 h-12 object-cover ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all"
                        />
                      ) : (
                        <div className="rounded-full bg-gradient-to-br from-blue-50 to-blue-100 w-12 h-12 flex items-center justify-center ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all">
                          <span className="text-blue-600 text-lg font-bold">
                            {post.user?.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {post.user?.username || "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>

                {editingPostId === post.id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                      rows={4}
                      placeholder="What's on your mind?"
                    />
                    {post.fileUrl && !editedImage && (
                      <div className="relative w-full h-72 rounded-lg overflow-hidden">
                        <Image
                          src={post.fileUrl}
                          alt="current"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    {editedImage && (
                      <div className="relative w-full h-72 rounded-lg overflow-hidden">
                        <Image
                          src={URL.createObjectURL(editedImage)}
                          alt="new"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 dark:text-black hover:bg-gray-100 transition-colors"
                      >
                        <ImagePlus className="h-4 w-4" />
                        Change Image
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEditedImage(file);
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => handleSubmitEdit(post.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {post.content.includes("youtube.com") ? (
                      <div
                        className="relative w-full"
                        style={{ paddingBottom: "56.25%" }}
                      >
                        <iframe
                          src={getYouTubeEmbedUrl(post.content)}
                          title="YouTube video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                        ></iframe>
                      </div>
                    ) : (
                      <p className="text-gray-700 text-lg leading-relaxed mb-6">
                        {post.content}
                      </p>
                    )}

                    <PostCard post={post} />
                    {session?.user?.id === post.user?.id && (
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(post.id, post.content)}
                          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {session && (
                  <div className="flex items-center gap-6 pt-4 border-t mt-6">
                    <ButtonLike
                      post={post}
                      session={session}
                      likeInProgress={likeInProgress}
                      setLikeInProgress={setLikeInProgress}
                      setPosts={setPosts}
                    />
                    <button
                      onClick={() => handleShowComments(post.id)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors py-2"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span>Comment ({post?.comments})</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors py-2">
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
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;

export function PostCard({ post }) {
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <div className="mb-8">
      {post.fileUrl && (
        <>
          <div
            className="relative w-full h-72 rounded-lg overflow-hidden mb-4 cursor-zoom-in transition-transform hover:scale-[1.02] ring-1 ring-gray-100"
            onClick={() => setShowImageModal(true)}
          >
            <Image
              src={post.fileUrl}
              alt="post image"
              fill
              className="object-cover"
            />
          </div>

          {showImageModal && (
            <div
              className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center backdrop-blur-sm"
              onClick={() => setShowImageModal(false)}
            >
              <div className="relative w-full max-w-4xl h-[85vh]">
                <Image
                  src={post.fileUrl}
                  alt="fullscreen"
                  fill
                  className="object-contain"
                />
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-6 right-6 text-white text-3xl hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
