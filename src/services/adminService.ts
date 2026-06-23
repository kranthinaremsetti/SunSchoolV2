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

  const userDoc = await getDoc(doc(db, "users", uid));

  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const user: any = userDoc.data();

  // -------------------------
  // Parent Approval
  // -------------------------
  if (user.role === "parent") {
    const parentDoc = await getDoc(
      doc(db, "parents", uid)
    );

    if (!parentDoc.exists()) {
      throw new Error(
        "Parent document not found"
      );
    }

    const parent: any = parentDoc.data();

    const studentRef = await addDoc(
  collection(db, "students"),
  {
    name: parent.studentName,
    rollNo: parent.rollNo,
    className: parent.className,
    section: parent.section,
    dob: parent.dob,
    parentId: uid,
  }
);

    await updateDoc(
      doc(db, "users", uid),
      {
        status: "approved",
        studentId: studentRef.id,
      }
    );

    await updateDoc(
      doc(db, "parents", uid),
      {
        linkedStudent: true,
      }
    );

    return;
  }

  // -------------------------
  // Teacher Approval
  // -------------------------
  if (user.role === "teacher") {
    await updateDoc(
      doc(db, "users", uid),
      {
        status: "approved",
      }
    );

    return;
  }
}

export async function rejectUser(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    status: "rejected",
  });
}