// service/userApi.ts

import { FullUser } from "../type/userType";

const userApi = (() => {
  const apiBaseUrl = "/api";

  const getOneUser = async (userId: string): Promise<FullUser> => {
    const res = await fetch(`${apiBaseUrl}/users/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch user ${userId}`);
    }
    return (await res.json()) as FullUser;
  };

  return {
    getOneUser,
  };
})();

export default userApi;
