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
    examType: string;
    marks: number;
    maxMarks: number;
    remarks: string;
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
  examType: string,
  marks: number,
  maxMarks: number,
  remarks: string,
  teacherUid: string
) => {
  await addDoc(collection(db, "results"), {
    studentId,
    subject,
    examType,
    marks,
    maxMarks,
    remarks,
    teacherUid,
    createdAt: serverTimestamp(),
  });
};