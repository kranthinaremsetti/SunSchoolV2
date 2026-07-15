import {
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
export const saveFee = async (
  studentId: string,
  academicYear: string,
  feeType: string,
  totalFee: number,
  paidAmount: number,
  dueDate: string
) => {
  const dueAmount = totalFee - paidAmount;

  let status = "Pending";

  if (dueAmount === 0) {
    status = "Paid";
  } else if (paidAmount > 0) {
    status = "Partially Paid";
  }

  await addDoc(collection(db, "fees"), {
    studentId,
    academicYear,
    feeType,
    totalFee,
    paidAmount,
    dueAmount,
    dueDate,
    status,
  });
};
export const getFees = async () => {
  const snapshot = await getDocs(collection(db, "fees"));

  return snapshot.docs.map((doc) => ({
    firestoreId: doc.id,
    ...(doc.data() as any),
  }));
};