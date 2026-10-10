import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
// @ts-ignore Firebase 12.x React Native export typing issue
import { getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyArdKP4rYApEnxnjjf35e5z5Tzn7Z3zTks",
  projectId: "sun-school-v2",
  storageBucket: "sun-school-v2.firebasestorage.app",
  messagingSenderId: "429205969920",
  appId: "1:429205969920:web:766f7e9af624a6113a0ce5",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;