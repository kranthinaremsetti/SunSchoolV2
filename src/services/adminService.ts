import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export async function getPendingUsers() {
  const q = query(
    collection(db, "users"),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function approveUser(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    status: "approved",
  });
}

export async function rejectUser(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    status: "rejected",
  });
}