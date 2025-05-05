import { icons } from "lucide-react";
import IndexProfile from "../../feature/profille/IndexProfile";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";

export async function generateMetadata() {
  const session = await getServerSession(authOptions);

  return {
    title: `${session.user.name}`,
    description:
      "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
    icons: {
      icon: session.user.photoUrl,
    },
    openGraph: {
      title: `${session.user.name}`,
      description:
        "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
      images: [
        {
          url: session.user.photoUrl,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${session.user.name}`,
      description:
        "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
      images: [session.user.photoUrl],
    },
  };
}

export default function Page({ params }: { params: any }) {
  const { id } = params;
  return <IndexProfile id={id} />;
}
