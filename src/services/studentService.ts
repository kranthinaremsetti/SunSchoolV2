import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export async function addStudent(student: any) {
  await addDoc(collection(db, "students"), student);
}

export async function getStudents() {
  const snapshot = await getDocs(collection(db, "students"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}