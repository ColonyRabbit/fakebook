import { icons } from "lucide-react";
import IndexProfile from "../../feature/profille/IndexProfile";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  return {
    title: `${session?.user?.name ?? "Profile"}`,
    description:
      "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
    icons: {
      icon: session?.user?.photoUrl ?? "/default-icon.png",
    },
    openGraph: {
      title: `${session?.user?.name ?? "Profile"}`,
      description:
        "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
      url: `https://fakebook.com/profile/${params.id}`,
      images: [
        {
          url: session?.user?.photoUrl ?? "/default-og.png",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${session?.user?.name ?? "Profile"}`,
      description:
        "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
      images: [session?.user?.photoUrl ?? "/default-og.png"],
    },
  };
}

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  return <IndexProfile id={id} />;
}
