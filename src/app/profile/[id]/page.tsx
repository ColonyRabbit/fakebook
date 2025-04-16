import IndexProfile from "../../feature/profille/IndexProfile";

export async function generateMetadata({ params }: { params: any }) {
  const { id } = params;
  return {
    title: `${id}`,
    description:
      "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
  };
}

export default function Page({ params }: { params: any }) {
  const { id } = params;
  return <IndexProfile id={id} />;
}
