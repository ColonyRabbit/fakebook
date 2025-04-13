"use client";

import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";
import {
  Post as PrismaPost,
  User as PrismaUser,
  Like as PrismaLike,
} from "@prisma/client";
import { toast } from "react-hot-toast";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../../@/components/ui/card";
import { Skeleton } from "../../../../../@/components/ui/skeleton";
import PostSkeleton from "./Skeleton";

interface PostWithUser extends PrismaPost {
  user: PrismaUser;
  likes: PrismaLike[];
  _count: {
    likes: number;
  };
  isLiked: boolean;
}

const Feet = () => {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likeInProgress, setLikeInProgress] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const url = session?.user?.id
        ? `/api/posts?userId=${session?.user?.id}`
        : `/api/posts`;
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : data.posts || []);
    } catch (err) {
      console.error(err);
      setError("Could not load posts");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session) fetchPosts();
  }, [session, fetchPosts]);

  const handleLike = useCallback(
    async (postId?: string) => {
      if (!postId) return;
      try {
        if (!session?.user?.id) {
          toast.error("กรุณาเข้าสู่ระบบก่อนกดไลค์");
          return;
        }
        if (likeInProgress === postId) return;
        setLikeInProgress(postId);

        const response = await fetch(`/api/posts/${postId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session?.user?.id }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to update like status");
        }

        const updatedPost = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === updatedPost.id ? updatedPost : post
          )
        );
      } catch (error: any) {
        console.error("Error liking post:", error);
        toast.error(error.message);
      } finally {
        setLikeInProgress(null);
      }
    },
    [session, likeInProgress]
  );

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 w-full">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        ฟีดข่าว
      </h2>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </Card>
      )}

      <div className="space-y-4">
        {!loading && posts?.length === 0 && (
          <Card className="p-8">
            <p className="text-center text-gray-500 dark:text-gray-400">
              ยังไม่มีโพสต์ในขณะนี้
            </p>
          </Card>
        )}

        {posts?.map((post) => (
          <Card
            key={post?.id}
            className="overflow-hidden transition-all duration-300 hover:shadow-lg"
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <Link href={`/profile/${post?.user?.id}`}>
                  <div className="flex items-center gap-3 group">
                    {post?.user?.photoUrl ? (
                      <Image
                        className="rounded-full ring-2 ring-offset-2 ring-gray-100 dark:ring-gray-800"
                        width={48}
                        height={48}
                        alt={post?.user?.username || "User"}
                        src={post?.user?.photoUrl}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {(post?.user?.username || "A")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {post?.user?.username || "Anonymous"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(post?.createdAt ?? "").toLocaleDateString(
                          "th-TH",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">
                {post?.content}
              </p>

              <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-500 rounded-full p-1">
                    <ThumbsUp className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {post?._count?.likes}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Button
                  variant="ghost"
                  className={`flex-1 ${
                    post?.isLiked
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  onClick={() => handleLike(post?.id)}
                  disabled={!session || likeInProgress === post?.id}
                >
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  {post?.isLiked ? "ถูกใจแล้ว" : "ถูกใจ"}
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 text-gray-600 dark:text-gray-400"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  แสดงความคิดเห็น
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 text-gray-600 dark:text-gray-400"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  แชร์
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!session && (
        <Card className="p-4 mt-6 text-center bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <p className="text-blue-600 dark:text-blue-400">
            กรุณาเข้าสู่ระบบเพื่อโต้ตอบกับโพสต์
          </p>
        </Card>
      )}
    </div>
  );
};

export default Feet;
