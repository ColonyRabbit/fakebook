"use client";

import React, { useState } from "react";

import { toast } from "react-hot-toast";
import { Textarea } from "../../../../../@/components/ui/textarea";
import { Button } from "../../../../components/ui/button";

interface CommentFormProps {
  postId: string;
  sender: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, sender }) => {
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/posts/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, comment, sender }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add comment");
      }
      setComment("");
      toast.success("Comment added successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <Textarea
        placeholder="เขียนความคิดเห็นที่นี่..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="resize-none dark:text-black"
      />
      <Button type="submit" disabled={submitting || !comment.trim()}>
        {submitting ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
      </Button>
    </form>
  );
};

export default CommentForm;
