// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCyuqws7ZsH5PSGU7BX0jBjXlLGGrACM4",
  authDomain: "fakebook-423cb.firebaseapp.com",
  projectId: "fakebook-423cb",
  storageBucket: "fakebook-423cb.firebasestorage.app",
  messagingSenderId: "344840122643",
  appId: "1:344840122643:web:47a72fa8bb52bb08f36ae6",
  measurementId: "G-NXTJM8L6RD",
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
