import { NextResponse } from "next/server";
import { cookies } from "next/headers";
// import prisma from "../../../../lib/prisma";

export async function POST() {
  try {
    // // ดึง session cookie
    // const sessionCookie = (await cookies()).get("session");

    // if (sessionCookie?.value) {
    //   // ลบ session จากฐานข้อมูล
    //   try {
    //     await prisma.session.delete({
    //       where: {
    //         id: sessionCookie.value,
    //       },
    //     });
    //   } catch (error) {
    //     console.error("Error deleting session:", error);
    //     // ถึงแม้จะเกิดข้อผิดพลาดในการลบ session จากฐานข้อมูล
    //     // เราก็ยังต้องลบ cookie ออกไป
    //   }
    // }

    // ลบ session cookie
    (
      await // ลบ session cookie
      cookies()
    ).delete("authToken");

    return NextResponse.json({ message: "ออกจากระบบสำเร็จ" }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการออกจากระบบ" },
      { status: 500 }
    );
  }
}
