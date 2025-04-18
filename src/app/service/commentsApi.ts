import { Comments, IResponseRCommentsType } from "../type/commentsType";

const commentsApi = (() => {
  const base = "/api/posts/comments";

  async function getComments(postId: string): Promise<IResponseRCommentsType> {
    const response = await fetch(`${base}/${postId}`);
    const res = await response.json();
    if (!response.ok) throw new Error("Failed to fetch comments");
    return res as IResponseRCommentsType;
  }

  async function createComment(
    postId: string,
    userId: string,
    content: string
  ): Promise<any> {
    const res = await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, sender: userId, comment: content }),
    });
    if (!res.ok) throw new Error("Failed to post comment");
    return (await res.json()) as any;
  }

  async function updateComment(
    commentId: string,
    content: string
  ): Promise<Comment> {
    const res = await fetch(base, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, content }),
    });
    if (!res.ok) throw new Error("Failed to update comment");
    return (await res.json()) as Comment;
  }

  async function deleteComment(commentId: string): Promise<void> {
    const res = await fetch(base, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });
    if (!res.ok) throw new Error("Failed to delete comment");
  }

  return { getComments, createComment, updateComment, deleteComment };
})();

export default commentsApi;
