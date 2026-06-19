import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArdKP4rYApEnxnjjf35e5z5Tzn7Z3zTks",
  authDomain: "sun-school-v2.firebaseapp.com",
  projectId: "sun-school-v2",
  storageBucket: "sun-school-v2.firebasestorage.app",
  messagingSenderId: "429205969920",
  appId: "1:429205969920:web:766f7e9af624a6113a0ce5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;