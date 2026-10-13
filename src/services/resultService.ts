
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { saveNotification } from "./notificationService";

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

  return snapshot.docs.map((resultDoc) => ({
    firestoreId: resultDoc.id,
    ...(resultDoc.data() as Omit<Result, "firestoreId">),
  }));
};

export const getResultsByStudent = async (
  studentId: string
): Promise<Result[]> => {
  if (!studentId.trim()) return [];

  const resultsQuery = query(
    collection(db, "results"),
    where("studentId", "==", studentId)
  );

  const snapshot = await getDocs(resultsQuery);

  return snapshot.docs.map((resultDoc) => ({
    firestoreId: resultDoc.id,
    ...(resultDoc.data() as Omit<Result, "firestoreId">),
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
): Promise<void> => {
  if (!studentId.trim() || !subject.trim() || !examType.trim()) {
    throw new Error("Student, subject, and exam type are required.");
  }

  if (
    !Number.isFinite(marks) ||
    !Number.isFinite(maxMarks) ||
    maxMarks <= 0 ||
    marks < 0 ||
    marks > maxMarks
  ) {
    throw new Error("Please enter valid marks within the maximum marks.");
  }

  // Save the exam result.
  await addDoc(collection(db, "results"), {
    studentId,
    subject: subject.trim(),
    examType: examType.trim(),
    marks,
    maxMarks,
    remarks: remarks.trim(),
    teacherUid,
    createdAt: serverTimestamp(),
  });

  // Notify the parent linked to this student.
  const percentage = ((marks / maxMarks) * 100).toFixed(1);

  await saveNotification(
    studentId,
    "Exam Result Published",
    `${examType.trim()} - ${subject.trim()}: ${marks}/${maxMarks} (${percentage}%).${
      remarks.trim() ? ` Remarks: ${remarks.trim()}` : ""
    }`,
    "Results"
  );
};
