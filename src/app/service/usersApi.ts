// service/userApi.ts
import { FullUser } from "../type/userType";

const userApi = (() => {
  // ใช้ .env สำหรับ URL จริง (เช่น production)
  const clientBaseUrl = "/api";
  const serverBaseUrl =
    process.env.NEXTAUTH_URL || "https://fakebook-psi-six.vercel.app/";

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

  const getOneUserServerSide = async (userId: string): Promise<FullUser> => {
    const res = await fetch(`${serverBaseUrl}/api/users/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store", // ป้องกัน SSR cache
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch user (SSR) ${userId}`);
    }

    return (await res.json()) as FullUser;
  };

  return {
    getOneUser,
    getOneUserServerSide,
  };
})();

export default userApi;
