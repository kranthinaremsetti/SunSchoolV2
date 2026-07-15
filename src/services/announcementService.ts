import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export const getAnnouncements = async () => {
  const snapshot = await getDocs(
    collection(db, "announcements")
  );

  return snapshot.docs.map((doc) => ({
    firestoreId: doc.id,
    ...(doc.data() as any),
  }));
};

export const saveAnnouncement = async (
  title: string,
  message: string,
  audience: string,
  priority: string
) => {
  await addDoc(
    collection(db, "announcements"),
    {
      title,
      message,
      audience,
      priority,
      createdAt: serverTimestamp(),
    }
  );
};