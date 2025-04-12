"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import Link from "next/link";

const Feet = () => {
  //local state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [likeInProgress, setLikeInProgress] = useState<string | null>(null); // เพิ่มสถานะกำลังกดไลค์

  //useeffect
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await getSession();
        setCurrentUser(session);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/posts", { method: "GET" });
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        console.log("Posts data:", data);

        // ตรวจสอบว่าข้อมูลเป็น array หรือไม่
        if (Array.isArray(data)) {
          setPosts(data);
        } else if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts);
        } else {
          setPosts([]);
          setError("Invalid data format received");
        }
      } catch (err) {
        setError("Could not load posts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchPosts();
  }, []);

  //function
  const handleLike = async (postId: string) => {
    try {
      if (!currentUser) {
        alert("กรุณาเข้าสู่ระบบก่อนกดไลค์");
        return;
      }

      // ป้องกันการกดซ้ำๆ ระหว่างรอการตอบกลับจาก API
      if (likeInProgress === postId) return;
      setLikeInProgress(postId);

      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      const updatedPost = await response.json();
      console.log("Updated post:", updatedPost);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === updatedPost.id ? updatedPost : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLikeInProgress(null); // รีเซ็ตสถานะเมื่อเสร็จสิ้น
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Recent Posts
      </h2>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading posts...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center my-4">
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {!loading && posts?.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p>No posts yet</p>
          </div>
        )}

        {posts?.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex justify-between items-center mb-3">
              <Link href={`/profile/${post.user?.username}`}>
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  {post.photoUrl ? (
                    <Image
                      className="rounded-full w-10 h-10"
                      width={40}
                      height={40}
                      alt={
                        post.username ||
                        "https://thumbs.dreamstime.com/b/nature-photo-freephoto-267878350.jpg"
                      }
                      src={
                        post.photoUrl ||
                        "https://thumbs.dreamstime.com/b/nature-photo-freephoto-267878350.jpg"
                      }
                    />
                  ) : (
                    <div className="rounded-full bg-gray-200 w-10 h-10 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  <p>{post.user?.username || "Anonymous"}</p>
                </h3>
              </Link>
              <span className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">{post.postText}</p>

            <div className="mt-4 pt-3 border-t border-gray-100 flex space-x-4">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center text-sm ${
                  post.isLiked
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-blue-600"
                }`}
                disabled={!currentUser || likeInProgress === post.id}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill={post.isLiked ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                {likeInProgress === post.id ? (
                  "Processing..."
                ) : (
                  <>
                    {post.isLiked ? "Unlike" : "Like"}{" "}
                    {post.likes?.length ||
                      post.likeCount ||
                      post._count?.likes ||
                      0}
                  </>
                )}
              </button>

              <button className="flex items-center text-gray-500 hover:text-blue-600 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Comment
              </button>
              <button className="flex items-center text-gray-500 hover:text-blue-600 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </button>
            </div>
            {!currentUser && (
              <p className="mt-2 text-sm text-gray-500">
                กรุณาเข้าสู่ระบบเพื่อโต้ตอบกับโพสต์
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feet;
