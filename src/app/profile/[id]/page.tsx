import IndexProfile from "../../feature/profille";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await Promise.resolve(params);

  return {
    title: `${id}`,
    description:
      "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await Promise.resolve(params);

  return <IndexProfile id={id} />;
}
