"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  Pencil,
  Share2,
  Trash2,
  X,
  ImagePlus,
  Loader2,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import Allcomments from "../../landingpage/components/Allcomments";
import postsApi from "../../../service/postsApi";
import usePostsList from "../hooks/usePostsList";
import { Card } from "../../../../../@/components/ui/card";
import ButtonLike from "./ButtonLike";
import LinkPreview from "../../../../components/LinkPreview";

export default function Postslist({ userId }: { userId: string }) {
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
  } = usePostsList();

  function extractYouTubeEmbedUrl(text?: string): string | null {
    if (!text) return null;
    const match = text.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/i
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }

  function extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  }

  useEffect(() => {
    const fetchPosts = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await postsApi.getYourPosts(userId, page, LIMIT);
        setPosts((prev) => [...prev, ...res.posts]);
        setHasMore(res.pagination?.hasMore ?? false);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดโพสต์ได้");
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    };

    fetchPosts();
  }, [page]);

  useEffect(() => {
    if (!observerRef?.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMorePosts();
        }
      },
      { rootMargin: "100px" }
    );

    const current = observerRef.current;
    observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [posts, observerRef, fetchMorePosts, hasMore]);

  return (
    <div className="p-6">
      {posts?.map((post, index) => {
        const isLast = index === posts.length - 1;
        const embedUrl = extractYouTubeEmbedUrl(post.content);
        const urls = extractUrls(post.content);
        const nonYoutubeUrls = urls.filter(
          (u) => !u.includes("youtube.com") && !u.includes("youtu.be")
        );

        return (
          <Card
            key={index}
            ref={isLast ? observerRef : null}
            className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 my-4"
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
                        className="rounded-full w-12 h-12 object-cover ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-blue-100 dark:group-hover:ring-blue-900 transition-all"
                      />
                    ) : (
                      <div className="rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 w-12 h-12 flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-blue-100 dark:group-hover:ring-blue-900 transition-all">
                        <span className="text-blue-600 dark:text-blue-300 text-lg font-bold">
                          {post.user?.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {post.user?.username || "Anonymous"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
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
                    className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900"
                    rows={4}
                    placeholder="What's on your mind?"
                  />
                </div>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4 whitespace-pre-line">
                    {post.content}
                  </p>
                  {embedUrl && (
                    <div
                      className="relative w-full mb-6"
                      style={{ paddingBottom: "56.25%" }}
                    >
                      <iframe
                        src={embedUrl}
                        title="YouTube video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                      />
                    </div>
                  )}
                  {nonYoutubeUrls.map((url, i) => (
                    <div key={i} className="my-4">
                      <LinkPreview url={url} />
                    </div>
                  ))}
                </>
              )}

              <PostCard
                post={post}
                setPosts={setPosts}
                setEditedImage={setEditedImage}
              />

              {session?.user?.id === post.user?.id && (
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(post.id, post.content)}
                    className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}

              {session && (
                <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                  <ButtonLike
                    post={post}
                    session={session}
                    likeInProgress={likeInProgress}
                    setLikeInProgress={setLikeInProgress}
                    setPosts={setPosts}
                  />
                  <button
                    onClick={() => handleShowComments(post.id)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Comment ({post?.comments})</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2">
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              )}

              {expandedComments[post.id] && <Allcomments postId={post.id} />}
            </div>
          </Card>
        );
      })}

      {loadingMore && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      )}
    </div>
  );
}

export function PostCard({ post, setPosts, setEditedImage }) {
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <div className="mb-8">
      {post.fileUrl && (
        <>
          <div
            className="relative w-full h-72 rounded-lg overflow-hidden mb-4 cursor-zoom-in transition-transform hover:scale-[1.02] ring-1 ring-gray-100 dark:ring-gray-700"
            onClick={() => setShowImageModal(true)}
          >
            <Image
              src={post.fileUrl}
              alt="post image"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setPosts((prev) =>
                  prev.map((p) =>
                    p.id === post.id ? { ...p, fileUrl: null } : p
                  )
                );
                setEditedImage(null);
              }}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {showImageModal && (
            <div
              className="fixed inset-0 z-50 bg-black/90 dark:bg-black/95 flex items-center justify-center backdrop-blur-sm"
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
                className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
