import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export const getLeaveRequests =
  async () => {
    const leaveRef =
      collection(
        db,
        "leaveRequests"
      );

    const snapshot =
      await getDocs(leaveRef);

    return snapshot.docs.map(
      (document) => ({
        firestoreId:
          document.id,
        studentId:
          document.data()
            .studentId,
        reason:
          document.data()
            .reason,
        fromDate:
          document.data()
            .fromDate,
        toDate:
          document.data()
            .toDate,
        status:
          document.data()
            .status,
      })
    );
  };

export const saveLeaveRequest =
  async (
    studentId: string,
    reason: string,
    fromDate: string,
    toDate: string
  ) => {
    await addDoc(
      collection(
        db,
        "leaveRequests"
      ),
      {
        studentId,
        reason,
        fromDate,
        toDate,
        status: "Pending",
      }
    );
  };

export const updateLeaveStatus =
  async (
    firestoreId: string,
    status: string
  ) => {
    const leaveDoc = doc(
      db,
      "leaveRequests",
      firestoreId
    );

    await updateDoc(
      leaveDoc,
      {
        status,
      }
    );
  };