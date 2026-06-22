import {
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export interface Notification {
  firestoreId: string;
  studentId: string;
  title: string;
  message: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const snapshot = await getDocs(
    collection(db, "notifications")
  );

  return snapshot.docs.map((doc) => ({
    firestoreId: doc.id,
    ...(doc.data() as Omit<Notification, "firestoreId">),
  }));
};

export const saveNotification = async (
  studentId: string,
  title: string,
  message: string
) => {
  await addDoc(
    collection(db, "notifications"),
    {
      studentId,
      title,
      message,
    }
  );
};