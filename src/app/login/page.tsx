import React from "react";
import IndexLogin from "../feature/login";
export async function generateMetadata() {
  return {
    title: `Login`,
    description:
      "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",

    openGraph: {
      description:
        "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",

      type: "website",
    },
    twitter: {
      description:
        "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
    },
  };
}
const page = () => {
  return <IndexLogin />;
};

export default page;
