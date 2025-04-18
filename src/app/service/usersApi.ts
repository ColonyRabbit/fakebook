// service/userApi.ts
import { User } from "@prisma/client";

const userApi = (() => {
  const apiBaseUrl = "/api";

  const getOneUser = async (userId: string): Promise<User> => {
    const res = await fetch(`${apiBaseUrl}/users/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch user ${userId}`);
    }
    return (await res.json()) as User;
  };

  return {
    getOneUser,
  };
})();

export default userApi;
