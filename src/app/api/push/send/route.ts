import { NextResponse } from "next/server";
import admin from "firebase-admin";

// 👇 สร้าง serviceAccount
const serviceAccount = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // สำคัญมาก
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
};

// 👇 ต้องเช็กให้ initializeApp แค่ครั้งเดียว
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export async function POST(req: Request) {
  try {
    const { targetFcmToken, title, body } = await req.json();

    const messaging = admin.messaging();

    await messaging.send({
      token: targetFcmToken,
      notification: {
        title,
        body,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending push:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
