// lib/firebaseClient.ts
import { getMessaging } from "firebase/messaging";
import { firebaseApp } from "./firebase";

let messaging;

if (typeof window !== "undefined") {
  messaging = getMessaging(firebaseApp);
}

export { messaging };
