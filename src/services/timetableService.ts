import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export interface Timetable {
  firestoreId: string;
  className: string;
  day: string;
  subjects: string[];
}

export const getTimetable = async (): Promise<Timetable[]> => {
  const snapshot = await getDocs(
    collection(db, "timetable")
  );

  return snapshot.docs.map((doc) => ({
    firestoreId: doc.id,
    ...(doc.data() as Omit<Timetable, "firestoreId">),
  }));
};