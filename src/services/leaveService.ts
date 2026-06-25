import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export const getLeaveRequests = async () => {
  const snapshot = await getDocs(
    collection(db, "leaveRequests")
  );

  return snapshot.docs.map((document) => ({
    firestoreId: document.id,
    userId: document.data().userId,
    role: document.data().role,
    leaveType: document.data().leaveType,
    reason: document.data().reason,
    description: document.data().description,
    fromDate: document.data().fromDate,
    toDate: document.data().toDate,
    attachmentUrl:
      document.data().attachmentUrl || "",
    status: document.data().status,
  }));
};

export const saveLeaveRequest = async (
  userId: string,
  role: "parent" | "teacher",
  leaveType: string,
  description: string,
  fromDate: string,
  toDate: string,
  attachmentUrl: string = ""
) => {
  await addDoc(
    collection(db, "leaveRequests"),
    {
      userId,
      role,
      leaveType,
      description,
      fromDate,
      toDate,
      attachmentUrl,
      status: "Pending",
    }
  );
};

export const updateLeaveStatus = async (
  firestoreId: string,
  status: string
) => {
  await updateDoc(
    doc(db, "leaveRequests", firestoreId),
    {
      status,
    }
  );
};