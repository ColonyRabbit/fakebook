// service/postsApi.ts

import { IResIResponsePostsType } from "../type/postType";

const postsApi = (() => {
  const apiBaseUrl = "/api";
  const getAllPosts = async (): Promise<IResIResponsePostsType> => {
    const res = await fetch(`${apiBaseUrl}/posts`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    return (await res.json()) as IResIResponsePostsType;
  };
  const deleteOnePost = async (id: string): Promise<IResIResponsePostsType> => {
    const res = await fetch(`${apiBaseUrl}/posts`, {
      method: "DELETE",
      body: JSON.stringify({ postId: id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to delete post");
    return (await res.json()) as IResIResponsePostsType;
  };
  const updateOnePost = async (
    content: string,
    postId: string
  ): Promise<IResIResponsePostsType> => {
    const res = await fetch(`${apiBaseUrl}/posts`, {
      method: "PATCH",
      body: JSON.stringify({ content, postId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to update post");
    return (await res.json()) as IResIResponsePostsType;
  };

  return { getAllPosts, deleteOnePost, updateOnePost };
})();
export default postsApi;
