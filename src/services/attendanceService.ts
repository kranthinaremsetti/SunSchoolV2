import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export interface AttendanceRecord {
  firestoreId: string;
  studentId: string;
  date: string;
  status: string;
  teacherUid?: string;
  className?: string;
  period?: string;
}

export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const snapshot = await getDocs(collection(db, "attendance"));

  return snapshot.docs.map((attendanceDoc) => ({
    firestoreId: attendanceDoc.id,
    ...attendanceDoc.data(),
  })) as AttendanceRecord[];
};

export const getStudentAttendance = async (
  studentId: string
): Promise<AttendanceRecord[]> => {
  const q = query(
    collection(db, "attendance"),
    where("studentId", "==", studentId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((attendanceDoc) => ({
    firestoreId: attendanceDoc.id,
    ...attendanceDoc.data(),
  })) as AttendanceRecord[];
};

const makeAttendanceId = (
  studentId: string,
  date: string,
  className: string,
  period: string
) =>
  `att_${encodeURIComponent(studentId)}_${date}_${encodeURIComponent(
    className
  )}_${encodeURIComponent(period)}`;

  

export const updateAttendanceStatus = async (
  attendanceId: string,
  newStatus: "Present" | "Absent",
  editorUid: string
): Promise<void> => {
  if (!attendanceId || !editorUid) {
    throw new Error("Attendance record and teacher are required.");
  }

  if (newStatus !== "Present" && newStatus !== "Absent") {
    throw new Error("Invalid attendance status.");
  }

  const attendanceRef = doc(db, "attendance", attendanceId);
  const snapshot = await getDoc(attendanceRef);

  if (!snapshot.exists()) {
    throw new Error("Attendance record not found.");
  }

  const currentData = snapshot.data();
  const oldStatus = currentData.status;

  if (oldStatus === newStatus) {
    return;
  }

  const historyEntry = {
    oldStatus,
    newStatus,
    editedBy: editorUid,
    editedAt: new Date().toISOString(),
  };

  await updateDoc(attendanceRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
    lastEditedBy: editorUid,
    editHistory: [
      ...(Array.isArray(currentData.editHistory)
        ? currentData.editHistory
        : []),
      historyEntry,
    ],
  });
};


export const saveAttendance = async (
  studentId: string,
  date: string,
  status: string,
  teacherUid: string,
  period: string = "1",
  className: string = ""
): Promise<string> => {
  if (!studentId || !date || !teacherUid || !className) {
    throw new Error(
      "Student, date, teacher and class are required."
    );
  }

  if (status !== "Present" && status !== "Absent") {
    throw new Error("Attendance status must be Present or Absent.");
  }

  const attendanceRef = doc(
    db,
    "attendance",
    makeAttendanceId(studentId, date, className, period)
  );

  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(attendanceRef);

    if (existing.exists()) {
      throw new Error(
        "Attendance already exists for this student, date, class and period."
      );
    }

    transaction.set(attendanceRef, {
      studentId,
      date,
      className,
      period,
      status,
      teacherUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return attendanceRef.id;
};
