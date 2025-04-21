// service/postsApi.ts

import { IRequestPostType, IResponsePostsType } from "../type/postType";

const postsApi = (() => {
  const apiBaseUrl = "/api";
  // GET: ควรระบุ Promise<T> ชัดเจนเพื่อให้ type ปลอดภัย
  const getAllPosts = async (page: number, limit: number): Promise<any> => {
    const res = await fetch(`/api/posts?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    const data = await res.json();
    return data as any;
  };
  // DELETE: ไม่จำเป็นต้องระบุ Promise<T> อย่างละเอียด หากไม่ต้องการใช้ type ในภายหลัง

  const deleteOnePost = async (id: string) => {
    const res = await fetch(`${apiBaseUrl}/posts`, {
      method: "DELETE",
      body: JSON.stringify({ postId: id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to delete post");
    return await res.json();
  };
  // UPDATE: ไม่จำเป็นต้องระบุ Promise<T> ถ้าไม่ใช้ผลลัพธ์แบบมี type เฉพาะ

  const updateOnePost = async (
    content: string,
    postId: string
  ): Promise<any> => {
    const res = await fetch(`${apiBaseUrl}/posts`, {
      method: "PATCH",
      body: JSON.stringify({ content, postId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to update post");
    return await res.json();
  };
  // POST: ไม่จำเป็นต้องระบุ Promise<T> หากไม่สนใจ type ที่ return
  const createPost = async (content: string, userId: string) => {
    const res = await fetch(`${apiBaseUrl}/posts`, {
      method: "POST",
      body: JSON.stringify({ content, userId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to create post");
    return await res.json();
  };

  return { getAllPosts, deleteOnePost, updateOnePost, createPost };
})();
export default postsApi;
