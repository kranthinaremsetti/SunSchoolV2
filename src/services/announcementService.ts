import {
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export const getAnnouncements =
  async () => {
    const announcementRef =
      collection(
        db,
        "announcements"
      );

    const snapshot =
      await getDocs(
        announcementRef
      );

    return snapshot.docs.map(
      (doc) => ({
        firestoreId: doc.id,
        title:
          doc.data().title,
        message:
          doc.data().message,
      })
    );
  };

export const saveAnnouncement =
  async (
    title: string,
    message: string
  ) => {
    await addDoc(
      collection(
        db,
        "announcements"
      ),
      {
        title,
        message,
      }
    );
  };