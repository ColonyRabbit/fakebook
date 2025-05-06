// src/app/profile/[id]/page.tsx
import { Metadata } from "next";
import IndexProfile from "../../feature/profille/IndexProfile";

type PageProps = {
  params: {
    id: string;
  };
};

// แก้ไขฟังก์ชัน generateMetadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: `Profile of ${params.id}`,
    description: "User profile page",
  };
}

// ฟังก์ชันแสดงหน้าจอ
export default async function Page({ params }: PageProps) {
  return <IndexProfile id={params.id} />;
}
