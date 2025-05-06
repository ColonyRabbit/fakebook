import { Metadata, ResolvingMetadata } from "next";
import userApi from "../../service/usersApi";
import IndexProfile from "../../feature/profille/IndexProfile";

// ✅ Type inferred จาก Next.js
type Props = {
  params: { id: string };
};

// ✅ ฟังก์ชันนี้ถูกต้องตาม Next.js 15
export async function generateMetadata(
  { params }: Props,
  parent?: ResolvingMetadata
): Promise<Metadata> {
  const user = await userApi.getOneUserServerSide(params.id);

  return {
    title: user.username,
    description: "โปรไฟล์ผู้ใช้งาน",
    icons: {
      icon: user.photoUrl,
    },
    openGraph: {
      title: user.username,
      description: "โปรไฟล์ผู้ใช้งาน",
      images: [{ url: user.photoUrl }],
    },
    twitter: {
      title: user.username,
      description: "โปรไฟล์ผู้ใช้งาน",
      images: [user.photoUrl],
    },
  };
}

// ✅ Page Component
export default function Page({ params }: Props) {
  return <IndexProfile id={params.id} />;
}
