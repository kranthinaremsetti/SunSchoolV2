import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  getDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export async function getStudents() {
  const snapshot = await getDocs(collection(db, "students"));

  const students = [];

  for (const studentDoc of snapshot.docs) {
    const student: any = studentDoc.data();

    let parentName = "-";
    let mobile = "-";

    if (student.parentId) {
      const parentDoc = await getDoc(
        doc(db, "parents", student.parentId)
      );

      const userDoc = await getDoc(
        doc(db, "users", student.parentId)
      );

      if (parentDoc.exists()) {
        parentName =
          parentDoc.data().fatherName || "-";
      }

      if (userDoc.exists()) {
        mobile =
          userDoc.data().mobile || "-";
      }
    }

    students.push({
      id: studentDoc.id,
      ...student,
      parentName,
      mobile,
    });
  }

  return students;
}

export async function getStudentByParent(
  parentId: string
) {
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

export async function addStudent(data: {
  name: string;
  rollNo: string;
  className: string;
  section: string;
  dob?: string;
  parentId?: string;
}) {
  const studentRef = await addDoc(collection(db, "students"), {
    name: data.name.trim(),
    rollNo: data.rollNo.trim(),
    className: data.className.trim(),
    section: data.section.trim(),
    dob: data.dob || "",
    parentId: data.parentId || "",
    createdAt: new Date(),
  });

  return studentRef.id;
}