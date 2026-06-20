import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

export async function registerParent(data: any) {
  const email = data.email.trim();

  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      data.password
    );

  const uid = userCredential.user.uid;

  // Users Collection
  await setDoc(doc(db, "users", uid), {
    uid,
    role: "parent",
    status: "pending",
    mobile: data.mobile,
    email,
    createdAt: new Date().toISOString(),
  });

  // Parent Collection
  await setDoc(doc(db, "parents", uid), {
    fatherName: data.fatherName,
    motherName: data.motherName,
    mobile: data.mobile,
    studentName: data.studentName,
    rollNo: data.rollNo,
    class: data.studentClass,
    section: data.section,
    dob: data.dob,
    aadhaar: data.aadhaar,
  });

  return userCredential.user;
}