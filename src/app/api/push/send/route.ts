import { NextResponse } from "next/server";
import admin, { ServiceAccount } from "firebase-admin";

let firebaseAdmin: typeof import("firebase-admin");

export async function POST(req: Request) {
  if (!firebaseAdmin) {
    firebaseAdmin = await import("firebase-admin");

    const serviceAccount = {
      type: process.env.GOOGLE_TYPE,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
    };

    if (!firebaseAdmin.apps.length) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(
          serviceAccount as admin.ServiceAccount
        ),
      });
    }
  }

  const { targetFcmToken, title, body } = await req.json();

  if (!targetFcmToken || !title || !body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const messaging = firebaseAdmin.messaging();

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
