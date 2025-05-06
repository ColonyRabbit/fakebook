import { icons } from "lucide-react";
import IndexProfile from "../../feature/profille/IndexProfile";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import userApi from "../../service/usersApi";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const res = await userApi.getOneUserServerSide(params.id);

  return {
    title: `${res.username}`,
    description:
      "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
    icons: {
      icon: res.photoUrl,
    },
    openGraph: {
      title: `${res.username}`,
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
      title: `${res.username}`,
      description:
        "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
      images: [res.photoUrl],
    },
  };
}

export default function Page({ params }: { params: any }) {
  const { id } = params;
  return <IndexProfile id={id} />;
}
