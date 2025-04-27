// ดึง Firebase SDK เข้ามา
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// ดึง IndexedDB idb library แบบ local เข้ามา
importScripts("/idb-iife.js"); // <-- ชี้ local แทน CDN

// Initial Config Firebase Project ของคุณ
firebase.initializeApp({
  apiKey: "AIzaSyBCyuqws7ZsH5PSGU7BX0jBjXlLGGrACM4",
  authDomain: "fakebook-423cb.firebaseapp.com",
  projectId: "fakebook-423cb",
  storageBucket: "fakebook-423cb.appspot.com",
  messagingSenderId: "344840122643",
  appId: "1:344840122643:web:47a72fa8bb52bb08f36ae6",
  measurementId: "G-NXTJM8L6RD",
});

// เรียกใช้ Firebase Messaging
const messaging = firebase.messaging();

// เปิด IndexedDB สำหรับเก็บ noti
const dbPromise = idb.openDB("noti-db", 1, {
  upgrade(db) {
    db.createObjectStore("notifications", {
      keyPath: "id",
      autoIncrement: true,
    });
  },
});

// รับข้อความ Background
messaging.onBackgroundMessage(async (payload) => {
  try {
    console.log(
      "[firebase-messaging-sw.js] Background message received:",
      payload
    );

    const notificationTitle = payload.notification?.title || "แจ้งเตือนใหม่";
    const notificationBody = payload.notification?.body || "";

    // บันทึกลง IndexedDB
    const db = await dbPromise;
    await db.add("notifications", {
      title: notificationTitle,
      body: notificationBody,
      timestamp: Date.now(),
    });

    // แสดง Notification popup
    if (self.registration && self.registration.showNotification) {
      await self.registration.showNotification(notificationTitle, {
        body: notificationBody,
        icon: "/logo.png", // รูปไอคอนโชว์ใน noti
        badge: "/logo.png", // รูป badge (ในมือถือ)
        timestamp: Date.now(),
      });
    }

    // BroadcastChannel ส่งเข้าแอป
    const bc = new BroadcastChannel("fcm_channel");
    bc.postMessage({
      title: notificationTitle,
      body: notificationBody,
      timestamp: Date.now(),
    });
    bc.close();
  } catch (error) {
    console.error("Error handling background message:", error);
  }
});
