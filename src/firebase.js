import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBE7FceqU9iRIFdMneWFgCL9Roxb5wzu_8",
  authDomain: "italy-trip-tracker.firebaseapp.com",
  projectId: "italy-trip-tracker",
  storageBucket: "italy-trip-tracker.firebasestorage.app",
  messagingSenderId: "452605270634",
  appId: "1:452605270634:web:e2b1c020b96788aee00813"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
