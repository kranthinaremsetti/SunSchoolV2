
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { saveNotification } from "./notificationService";

export interface Homework {
  firestoreId: string;
  className: string;
  subject: string;
  task: string;
  dueDate: string;
  teacherUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export const getHomework = async (): Promise<Homework[]> => {
  const snapshot = await getDocs(collection(db, "homework"));

  return snapshot.docs
    .map((homeworkDoc) => ({
      firestoreId: homeworkDoc.id,
      ...(homeworkDoc.data() as Omit<Homework, "firestoreId">),
    }))
    .sort((a, b) => {
      const dateA = (a.createdAt as any)?.toMillis?.() ?? 0;
      const dateB = (b.createdAt as any)?.toMillis?.() ?? 0;
      return dateB - dateA;
    });
};

export const saveHomework = async (
  className: string,
  subject: string,
  task: string,
  dueDate: string,
  teacherUid: string
) => {
  const cleanClass = className.trim();
  const cleanSubject = subject.trim();
  const cleanTask = task.trim();

  if (!cleanClass || !cleanSubject || !cleanTask || !dueDate.trim()) {
    throw new Error("Please provide the class, subject, task, and due date.");
  }

  await addDoc(collection(db, "homework"), {
    className: cleanClass,
    subject: cleanSubject,
    task: cleanTask,
    dueDate,
    teacherUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await notifyClassParents(
    cleanClass,
    "New Homework",
    `${cleanSubject}: ${cleanTask}. Due date: ${dueDate}.`
  );
};

export const updateHomework = async (
  homeworkId: string,
  className: string,
  subject: string,
  task: string,
  dueDate: string
) => {
  const cleanClass = className.trim();
  const cleanSubject = subject.trim();
  const cleanTask = task.trim();

  if (
    !homeworkId.trim() ||
    !cleanClass ||
    !cleanSubject ||
    !cleanTask ||
    !dueDate.trim()
  ) {
    throw new Error("Please provide all homework details.");
  }

  const homeworkRef = doc(db, "homework", homeworkId);
  const existingSnapshot = await getDocs(
    query(collection(db, "homework"), where("__name__", "==", homeworkId))
  );

  if (existingSnapshot.empty) {
    throw new Error("This homework no longer exists.");
  }

  const previousData = existingSnapshot.docs[0].data();

  await updateDoc(homeworkRef, {
    className: cleanClass,
    subject: cleanSubject,
    task: cleanTask,
    dueDate,
    updatedAt: serverTimestamp(),
  });
  // Reset completion status whenever homework is updated
const completionsQuery = query(
  collection(db, "homeworkCompletions"),
  where("homeworkId", "==", homeworkId)
);

const completionsSnapshot = await getDocs(completionsQuery);

await Promise.all(
  completionsSnapshot.docs.map((completionDoc) =>
    updateDoc(completionDoc.ref, {
      completed: false,
      completedAt: null,
      resetAt: serverTimestamp(),
    })
  )
);
  // Notify students in the updated class.
  // If the class changed, also notify the previous class.
  await notifyClassParents(
    cleanClass,
    "Homework Updated",
    `${cleanSubject}: ${cleanTask}. New due date: ${dueDate}.`
  );

  if (
    typeof previousData.className === "string" &&
    previousData.className !== cleanClass
  ) {
    await notifyClassParents(
      previousData.className,
      "Homework Updated",
      `Homework "${String(previousData.subject ?? "Assignment")}" has been moved to another class. Please check the homework list.`
    );
  }
};

const notifyClassParents = async (
  className: string,
  title: string,
  message: string
) => {
  const studentsQuery = query(
    collection(db, "students"),
    where("className", "==", className)
  );

  const studentsSnapshot = await getDocs(studentsQuery);

  await Promise.all(
    studentsSnapshot.docs.map((studentDoc) =>
      saveNotification(studentDoc.id, title, message, "Homework")
    )
  );
};
