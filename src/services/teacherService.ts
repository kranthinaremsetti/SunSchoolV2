import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export async function getTeachers() {
  const teacherSnapshot = await getDocs(
    collection(db, "teachers")
  );

  const teachers = [];

  for (const teacherDoc of teacherSnapshot.docs) {
    const teacher: any = teacherDoc.data();

    const userDoc = await getDoc(
      doc(db, "users", teacherDoc.id)
    );

    if (!userDoc.exists()) continue;

    const user: any = userDoc.data();

    // Show only approved teachers
    if (
      user.role !== "teacher" ||
      user.status !== "approved"
    ) {
      continue;
    }

    teachers.push({
      id: teacherDoc.id,
      ...teacher,
      email: user.email,
      mobile: user.mobile,
    });
  }

  return teachers;
}

export async function updateTeacher(
  id: string,
  data: any
) {
  await updateDoc(
    doc(db, "teachers", id),
    data
  );
}

export async function deleteTeacher(
  id: string
) {
  await deleteDoc(
    doc(db, "teachers", id)
  );

  await deleteDoc(
    doc(db, "users", id)
  );
}