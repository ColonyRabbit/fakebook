import { IResIResponsePostsType } from "../type/postType";

// postsApi.ts
const postsApi = (() => {
  const apiBaseUrl = "/api";

  const getAllPosts = async (): Promise<IResIResponsePostsType> => {
    const response = await fetch(`${apiBaseUrl}/posts`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("postsApi failed");
    }

    const data = await response.json();
    return data as IResIResponsePostsType;
  };

  return {
    getAllPosts,
  };
})();

export default postsApi;
