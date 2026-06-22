import {
  collection,
 getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export interface Result {
  firestoreId: string;
  studentId: string;
  subject: string;
  marks: number;
  teacherUid?: string;
}

export const getResults = async (): Promise<Result[]> => {
  const snapshot = await getDocs(collection(db, "results"));

  return snapshot.docs.map((doc) => ({
    firestoreId: doc.id,
    ...(doc.data() as Omit<Result, "firestoreId">),
  }));
};

export const saveResult = async (
  studentId: string,
  subject: string,
  marks: number,
  teacherUid: string
) => {
  await addDoc(collection(db, "results"), {
    studentId,
    subject,
    marks,
    teacherUid,
    createdAt: serverTimestamp(),
  });
};