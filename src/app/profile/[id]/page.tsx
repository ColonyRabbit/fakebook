// app/(your-segment)/profile/[id]/page.tsx

import { Metadata } from "next";
import userApi from "../../service/usersApi";
import IndexProfile from "../../feature/profille/IndexProfile";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
      images: [
        {
          url: res.photoUrl,
        },
      ],
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

export default function Page({ params }: Props) {
  return <IndexProfile id={params.id} />;
}
