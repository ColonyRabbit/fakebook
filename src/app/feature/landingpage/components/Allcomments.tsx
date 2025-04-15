"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { parseISO, formatDistanceToNow, isValid } from "date-fns";
import { MessageSquare, Loader2, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../../@/components/ui/textarea";
import Link from "next/link";

export interface User {
  id?: string;
  username?: string;
  email?: string;
  password?: string;
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  postId?: string;
  user?: User;
}

interface AllcommentsProps {
  postId: string;
}

const Allcomments = ({ postId }: AllcommentsProps) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState<string>("");

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/posts/comments/${postId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(Array.isArray(data) ? data : data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Could not load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session?.user) return;
    try {
      const res = await fetch(`/api/posts/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          comment: newComment,
          sender: session.user.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const comment = await res.json();
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      setError("Failed to post comment");
    }
  };

  const handleEdit = (commentId?: string, currentContent?: string) => {
    setEditingCommentId(commentId || null);
    setEditedComment(currentContent || "");
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedComment("");
  };

  const handleSaveEdit = async (commentId?: string) => {
    if (!commentId) return;
    try {
      const res = await fetch(`/api/posts/comments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          content: editedComment,
        }),
      });
      if (!res.ok) throw new Error("Failed to update comment");
      const updatedComment = await res.json();
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === updatedComment.id ? updatedComment : comment
        )
      );
      toast.success("Comment updated successfully");
      setEditingCommentId(null);
      setEditedComment("");
    } catch (error: any) {
      console.error("Error updating comment:", error);
      toast.error(error.message);
    }
  };

  const handleDelete = async (commentId?: string) => {
    if (!commentId) return;
    try {
      const res = await fetch(`/api/posts/comments/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      toast.success("Comment deleted successfully");
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const hasComments = Array.isArray(comments) && comments.length > 0;

  return (
    <div className="space-y-6">
      {session?.user && (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-3 py-2 border text-black border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <Button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ยืนยัน
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {!hasComments ? (
          <div className="text-center py-6">
            <MessageSquare className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No comments yet</p>
          </div>
        ) : (
          comments.map((comment, index) => {
            const parsedDate = parseISO(comment.createdAt ?? "");
            const dateText = isValid(parsedDate)
              ? formatDistanceToNow(parsedDate, { addSuffix: true })
              : "Invalid date";
            return (
              <div
                key={index + 1}
                className="flex gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <Link href={`/profile/${comment.user?.id}`}>
                    <div className="relative h-10 w-10">
                      {comment.user?.photoUrl ? (
                        <Image
                          src={comment.user.photoUrl}
                          alt={comment.user.username || "User"}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            {(comment.user?.username || "U")[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {comment.user?.username || "Anonymous"}
                    </span>
                    <span className="text-sm text-gray-500">{dateText}</span>
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveEdit(comment.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700">{comment.content}</p>
                  )}
                  {session?.user?.id === comment.user?.id &&
                    editingCommentId !== comment.id && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() =>
                            handleEdit(comment.id, comment.content)
                          }
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(comment.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!session && hasComments && (
        <div className="text-center py-4">
          <p className="text-gray-500">Sign in to leave a comment</p>
        </div>
      )}
    </div>
  );
};

export default Allcomments;
