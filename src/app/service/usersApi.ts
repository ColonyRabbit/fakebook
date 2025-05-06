// service/userApi.ts
import { FullUser } from "../type/userType";

const userApi = (() => {
  // ใช้ .env สำหรับ URL จริง (เช่น production)
  const clientBaseUrl = "/api";

  const getOneUser = async (userId: string): Promise<FullUser> => {
    const res = await fetch(`${clientBaseUrl}/users/${userId}`, {
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
