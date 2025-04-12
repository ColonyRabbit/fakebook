import React from "react";
import IndexLandingPage from "./feature/landingpage";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Fakebook",
  description:
    "เชื่อมต่อ แบ่งปัน และสร้างความทรงจำกับเพื่อนๆ ของคุณบนแพลตฟอร์มโซเชียลมีเดียที่ปลอดภัยและเป็นมิตร",
};
const HomePage = () => {
  return <IndexLandingPage />;
};

export default HomePage;
