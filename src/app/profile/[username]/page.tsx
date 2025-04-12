// app/profile/[id]/page.tsx (Server Component)
import IndexProfile from "../../feature/profille";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  return {
    title: `โปรไฟล์ผู้ใช้ ${params.username}`,
    description:
      "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
  };
}

export default function Page({ params }: { params: { username: string } }) {
  return <IndexProfile username={params.username} />;
}
