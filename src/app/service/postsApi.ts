// service/postsApi.ts
const postsApi = (() => {
  const apiBaseUrl = "/api";
  // GET: ควรระบุ Promise<T> ชัดเจนเพื่อให้ type ปลอดภัย
  const getAllPosts = async (
    page: number,
    limit: number
  ): Promise<GetAllPostsResponse> => {
    const res = await fetch(`/api/posts?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    const data = await res.json();
    return data as GetAllPostsResponse;
  };

  const getYourPosts = async (
    userId: string,
    page: number,
    limit: number
  ): Promise<any> => {
    const res = await fetch(
      `/api/posts/profilePosts/${userId}?page=${page}&limit=${limit}`
    );
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
  const createPost = async (
    content?: string,
    file?: File | null,
    userId?: string
  ) => {
    const formData = new FormData();
    formData.append("content", content);
    formData.append("userId", userId);
    if (file) {
      formData.append("file", file);
    }
    const res = await fetch("/api/posts", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to create post");
    return await res.json();
  };

  return {
    getAllPosts,
    deleteOnePost,
    updateOnePost,
    createPost,
    getYourPosts,
  };
})();
export default postsApi;
