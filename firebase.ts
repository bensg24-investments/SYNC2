
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFPpSfAZfB1U43wyCfEFKL24NMjew-H34",
  authDomain: "sync-6b31f.firebaseapp.com",
  projectId: "sync-6b31f",
  storageBucket: "sync-6b31f.firebasestorage.app",
  messagingSenderId: "453145506117",
  appId: "1:453145506117:web:863ee5e02e7845f2270e2c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
