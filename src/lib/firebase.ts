import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsd7Hr-VH6PwyEoAhzIQsJGraxhFF5wWY",
  authDomain: "punarcycle.firebaseapp.com",
  projectId: "punarcycle",
  storageBucket: "punarcycle.firebasestorage.app",
  messagingSenderId: "851323489896",
  appId: "1:851323489896:web:6f8f7248a8c550c7ef35dd",
  measurementId: "G-GNHFVE7SPB",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
