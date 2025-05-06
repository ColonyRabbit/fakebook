// app/(your-segment)/profile/[id]/page.tsx

import { Metadata } from "next";
import userApi from "../../service/usersApi";
import IndexProfile from "../../feature/profille/IndexProfile";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const res = await userApi.getOneUserServerSide(params.id);

  return {
    title: res.username,
    description:
      "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
    icons: {
      icon: res.photoUrl,
    },
    openGraph: {
      title: res.username,
      description:
        "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
      images: [{ url: res.photoUrl }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: res.username,
      description:
        "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
      images: [res.photoUrl],
    },
  };
}

// ✅ หน้านี้สามารถใช้ interface ได้
interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <IndexProfile id={params.id} />;
}
