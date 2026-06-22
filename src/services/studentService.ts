import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export async function addStudent(student: any) {
  return await addDoc(collection(db, "students"), student);
}

export async function getStudents() {
  const snapshot = await getDocs(collection(db, "students"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getStudentByParent(parentId: string) {
  const q = query(
    collection(db, "students"),
    where("parentId", "==", parentId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  };
}

export async function deleteStudent(id: string) {
  await deleteDoc(doc(db, "students", id));
}

export async function updateStudent(
  id: string,
  data: any
) {
  await updateDoc(doc(db, "students", id), data);
}