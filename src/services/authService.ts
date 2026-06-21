import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

export async function registerParent(data: any) {
  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      data.email.trim(),
      data.password
    );

  const uid = userCredential.user.uid;

  await setDoc(doc(db, "users", uid), {
    uid,
    role: "parent",
    status: "pending",
    email: data.email,
    mobile: data.mobile,
  });

  await setDoc(doc(db, "parents", uid), {
    fatherName: data.fatherName,
    motherName: data.motherName,
    studentName: data.studentName,
    rollNo: data.rollNo,
    class: data.studentClass,
    section: data.section,
    dob: data.dob,
    aadhaar: data.aadhaar,
  });
}

export async function loginUser(
  email: string,
  password: string
) {
  const credential =
    await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

  const uid = credential.user.uid;

  const userDoc = await getDoc(
    doc(db, "users", uid)
  );

  return userDoc.data();
}