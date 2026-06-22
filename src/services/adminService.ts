import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  getDoc,
  addDoc,
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
  console.log("UID:", uid);

  const parentDoc = await getDoc(doc(db, "parents", uid));

  console.log("Parent Exists:", parentDoc.exists());

  if (!parentDoc.exists()) {
    throw new Error("Parent document not found");
  }

  const parent: any = parentDoc.data();

  console.log(parent);

  const studentRef = await addDoc(collection(db, "students"), {
    name: parent.studentName,
    rollNo: parent.rollNo,
    className: parent.class,
    section: parent.section,
    dob: parent.dob,
    parentId: uid,
  });

  await updateDoc(doc(db, "users", uid), {
    status: "approved",
    studentId: studentRef.id,
  });

  await updateDoc(doc(db, "parents", uid), {
    linkedStudent: true,
  });
}

export async function rejectUser(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    status: "rejected",
  });
}