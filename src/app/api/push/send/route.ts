// /app/api/push/send/route.ts

import { NextResponse } from "next/server";
import admin from "firebase-admin";

// 🔥 เอาค่า service account มาตรงนี้
import path from "path";
import { readFileSync } from "fs";

// โหลด service account จากไฟล์ตรงๆ
const serviceAccountPath = path.resolve(process.cwd(), "lib", "fakebook.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function POST(req: Request) {
  const { targetFcmToken, title, body } = await req.json();

  if (!targetFcmToken || !title || !body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const messaging = admin.messaging();

    await messaging.send({
      token: targetFcmToken,
      notification: {
        title,
        body,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending push:", error);
    return NextResponse.json({ error: "Failed to send push" }, { status: 500 });
  }
}
