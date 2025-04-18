import { ThumbsUp } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import { Button } from "../../../../components/ui/button";

interface ButtonLikeProps {
  post: {
    id: string;
    isLiked: boolean;
    likeCount: number;
  };
  session: any;
  likeInProgress: string | null;
  setLikeInProgress: React.Dispatch<React.SetStateAction<string | null>>;
  setPosts: React.Dispatch<React.SetStateAction<any[]>>;
}

const ButtonLike: React.FC<ButtonLikeProps> = ({
  post,
  session,
  likeInProgress,
  setLikeInProgress,
  setPosts,
}) => {
  const handleLike = async (postId?: string) => {
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
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update like status");
      }

      const updatedPost = await response.json();
      if (updatedPost?.id) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  isLiked: !p.isLiked,
                  likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
                }
              : p
          )
        );
      }
    } catch (error: any) {
      console.error("Error liking post:", error);
      toast.error(error.message);
    } finally {
      setLikeInProgress(null);
    }
  };
  return (
    <Button
      onClick={() => handleLike(post.id)}
      disabled={!session || likeInProgress === post.id}
      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
        post.isLiked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
      }`}
    >
      <ThumbsUp className={`h-5 w-5 ${post.isLiked ? "fill-current" : ""}`} />
      <span>{post.likeCount}</span>
    </Button>
  );
};

export default ButtonLike;
