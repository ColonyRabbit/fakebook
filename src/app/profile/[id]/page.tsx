import { icons } from "lucide-react";
import IndexProfile from "../../feature/profille/IndexProfile";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import userApi from "../../service/usersApi";

// กำหนด interface สำหรับ params และ metadata
interface PageProps {
  params: {
    id: string;
  };
}

// กำหนด type สำหรับ response จาก API
interface UserResponse {
  username: string;
  photoUrl: string;
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const res = (await userApi.getOneUserServerSide(params.id)) as UserResponse;

    return {
      title: res.username || "User Profile",
      description:
        "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
      icons: {
        icon: res.photoUrl || "/default-avatar.png",
      },
      openGraph: {
        title: res.username || "User Profile",
        description:
          "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
        images: [
          {
            url: res.photoUrl || "/default-avatar.png",
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: res.username || "User Profile",
        description:
          "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
        images: [res.photoUrl || "/default-avatar.png"],
      },
    };
  } catch (error) {
    // ถ้าเกิด error ให้ return metadata เริ่มต้น
    return {
      title: "User Profile",
      description: "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ",
    };
  }
}

export default async function Page({ params }: PageProps) {
  try {
    const { id } = params;
    const userData = await userApi.getOneUserServerSide(id);
    return <IndexProfile id={id} />;
  } catch (error) {
    // จัดการ error state
    return <div>Something went wrong</div>;
  }
}
