
import {
  addDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export interface FeeRecord {
  firestoreId: string;
  studentId: string;
  academicYear: string;
  feeType: string;
  totalFee: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
  status: "Pending" | "Partially Paid" | "Paid";
}

export const saveFee = async (
  studentId: string,
  academicYear: string,
  feeType: string,
  totalFee: number,
  paidAmount: number,
  dueDate: string
) => {
  if (!studentId) throw new Error("Please select a student.");
  if (!Number.isFinite(totalFee) || totalFee <= 0) {
    throw new Error("Total fee must be greater than zero.");
  }
  if (!Number.isFinite(paidAmount) || paidAmount < 0 || paidAmount > totalFee) {
    throw new Error("Paid amount must be between zero and the total fee.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    throw new Error("Due date must use YYYY-MM-DD format.");
  }

  const dueAmount = Math.max(0, totalFee - paidAmount);
  const status =
    dueAmount === 0
      ? "Paid"
      : paidAmount > 0
      ? "Partially Paid"
      : "Pending";

  await addDoc(collection(db, "fees"), {
    studentId,
    academicYear,
    feeType,
    totalFee,
    paidAmount,
    dueAmount,
    dueDate,
    status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getFees = async (): Promise<FeeRecord[]> => {
  const snapshot = await getDocs(collection(db, "fees"));

  return snapshot.docs.map((item) => ({
    firestoreId: item.id,
    ...(item.data() as Omit<FeeRecord, "firestoreId">),
  }));
};

export const getStudentFees = async (
  studentId: string
): Promise<FeeRecord[]> => {
  const feesQuery = query(
    collection(db, "fees"),
    where("studentId", "==", studentId)
  );

  const snapshot = await getDocs(feesQuery);

  return snapshot.docs.map((item) => ({
    firestoreId: item.id,
    ...(item.data() as Omit<FeeRecord, "firestoreId">),
  }));
};

export const getUnpaidFees = async (): Promise<FeeRecord[]> => {
  const snapshot = await getDocs(
    query(collection(db, "fees"), where("status", "!=", "Paid"))
  );

  return snapshot.docs.map((item) => ({
    firestoreId: item.id,
    ...(item.data() as Omit<FeeRecord, "firestoreId">),
  }));
};

export const updateFeePayment = async (
  feeId: string,
  totalFee: number,
  paidAmount: number
) => {
  if (!Number.isFinite(totalFee) || totalFee <= 0) {
    throw new Error("Total fee must be greater than zero.");
  }
  if (!Number.isFinite(paidAmount) || paidAmount < 0 || paidAmount > totalFee) {
    throw new Error("Paid amount must be between zero and the total fee.");
  }

  const dueAmount = Math.max(0, totalFee - paidAmount);
  const status =
    dueAmount === 0
      ? "Paid"
      : paidAmount > 0
      ? "Partially Paid"
      : "Pending";

  await updateDoc(doc(db, "fees", feeId), {
    totalFee,
    paidAmount,
    dueAmount,
    status,
    updatedAt: serverTimestamp(),
  });
};