import { FullUser } from "../type/userType";

//usersApi.ts
const usersApi = (() => {
  const apiBaseUrl = "/api";
  const getUser = async (id: string): Promise<FullUser> => {
    const response = await fetch(`${apiBaseUrl}/users/${id}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    const data = (await response.json()) as FullUser;
    return data;
  };

  return {
    getUser,
  };
})();

export default usersApi;
