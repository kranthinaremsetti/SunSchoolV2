import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
export const getAttendanceRecords = async () => {
  const snapshot = await getDocs(
    collection(db, "attendance")
  );

  return snapshot.docs.map((doc) => ({
    firestoreId: doc.id,
    studentId: doc.data().studentId,
    date: doc.data().date,
    status: doc.data().status,
  }));
};

export const saveAttendance = async (
  studentId: string,
  date: string,
  status: string,
  teacherUid: string
) => {
  await addDoc(collection(db, "attendance"), {
    studentId,
    date,
    status,
    teacherUid,
    createdAt: serverTimestamp(),
  });
};