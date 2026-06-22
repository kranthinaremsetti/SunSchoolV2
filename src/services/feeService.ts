import {
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
export const saveFee = async (
  studentId: number,
  totalFee: number,
  paidAmount: number,
  dueDate: string
) => {
  await addDoc(
    collection(db, "fees"),
    {
      studentId,
      totalFee,
      paidAmount,
      dueAmount:
        totalFee - paidAmount,
      dueDate,
    }
  );
};
export const getFees = async () => {
  const feesRef =
    collection(db, "fees");

  const snapshot =
    await getDocs(feesRef);
  console.log(
  "Fee Docs:",
  snapshot.docs.length
);
  return snapshot.docs.map((doc) => ({
    firestoreId: doc.id,
    studentId:
      doc.data().studentId,
    totalFee:
      doc.data().totalFee,
    paidAmount:
      doc.data().paidAmount,
    dueAmount:
      doc.data().dueAmount,
    dueDate:
      doc.data().dueDate,
  }));
};