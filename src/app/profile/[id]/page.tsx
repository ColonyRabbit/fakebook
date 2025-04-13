import IndexProfile from "../../feature/profille";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: await `${params.id}`,
    description:
      "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <IndexProfile id={params.id} />;
}
