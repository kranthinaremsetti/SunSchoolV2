import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export const getHolidays = async () => {
  const snapshot = await getDocs(
    collection(db, "holidays")
  );

  return snapshot.docs.map((doc) => ({
    firestoreId: doc.id,
    ...doc.data(),
  }));
};