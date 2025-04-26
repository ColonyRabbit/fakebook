importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);
importScripts("https://cdn.jsdelivr.net/npm/idb@7/build/iife/index-min.js");
const dbPromise = idb.openDB("noti-db", 1, {
  upgrade(db) {
    db.createObjectStore("notifications", {
      keyPath: "id",
      autoIncrement: true,
    });
  },
});
firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async function (payload) {
  try {
    console.log("[firebase-messaging-sw.js] Background message:", payload);

    const notificationTitle = payload.notification?.title || "แจ้งเตือนใหม่";
    const notificationBody = payload.notification?.body || "";

    // บันทึกลง IndexedDB
    const db = await dbPromise;
    await db.add("notifications", {
      title: notificationTitle,
      body: notificationBody,
      timestamp: Date.now(),
    });

    // แสดง notification
    await self.registration.showNotification(notificationTitle, {
      body: notificationBody,
      icon: "/logo.png",
      badge: "/logo.png",
      timestamp: Date.now(),
    });

    // ส่งข้อมูลผ่าน BroadcastChannel
    const bc = new BroadcastChannel("fcm_channel");
    bc.postMessage({
      title: notificationTitle,
      body: notificationBody,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error handling background message:", error);
  }
});
