import { Metadata } from "next";
import userApi from "../../service/usersApi";
import IndexProfile from "../../feature/profille/IndexProfile";

// ✅ ประกาศ props ให้ถูกต้อง
interface PageProps {
  params: {
    id: string;
  };
}

// ✅ generateMetadata รับ PageProps
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
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

// ✅ Page component รับ PageProps เช่นกัน
export default function Page({ params }: { params: { id: string } }) {
  return <IndexProfile id={params.id} />;
}
