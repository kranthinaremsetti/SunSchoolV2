import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export interface Homework {
  firestoreId: string;
  className: string;
  subject: string;
  task: string;
  dueDate: string;
  teacherUid?: string;
}

export const getHomework = async (): Promise<Homework[]> => {
  const snapshot = await getDocs(collection(db, "homework"));

  return snapshot.docs.map((doc) => ({
    firestoreId: doc.id,
    ...(doc.data() as Omit<Homework, "firestoreId">),
  }));
};

export const saveHomework = async (
  className: string,
  subject: string,
  task: string,
  dueDate: string,
  teacherUid: string
) => {
  await addDoc(collection(db, "homework"), {
    className,
    subject,
    task,
    dueDate,
    teacherUid,
    createdAt: serverTimestamp(),
  });
};