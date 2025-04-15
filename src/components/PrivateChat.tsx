// components/FloatingChatWrapper.tsx ✅ เป็น Server Component
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authOptions";
import FloatingChat from "./FloatingChat"; // ด้านล่างคือ client component

export default async function FloatingChatWrapper() {
  const session = await getServerSession(authOptions);

  return <FloatingChat username={session?.user?.name || "Guest"} />;
}
