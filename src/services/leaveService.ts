
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { saveNotification } from "./notificationService";


export const getLeaveRequests = async () => {
  const snapshot = await getDocs(collection(db, "leaveRequests"));

  const requests = await Promise.all(
    snapshot.docs.map(async (document) => {
      const data = document.data();

      let requesterName = "Unknown";
      let studentName = "";
      let className = "";
      let section = "";
      let rollNo = "";
      let subject = "";

      try {
        const userSnapshot = await getDoc(
          doc(db, "users", data.userId)
        );

        if (userSnapshot.exists()) {
          const user = userSnapshot.data();

          requesterName =
            user.name ||
            user.fullName ||
            user.displayName ||
            user.username ||
            "Unknown";

          if (data.role === "parent" && user.studentId) {
            const studentSnapshot = await getDoc(
              doc(db, "students", String(user.studentId))
            );

            if (studentSnapshot.exists()) {
              const student = studentSnapshot.data();

              studentName =
                student.name || student.studentName || "Unknown";
              className = student.className || "";
              section = student.section || "";
              rollNo = String(student.rollNo ?? "");
            }
          }

          if (data.role === "teacher") {
            subject = user.subject || user.subjectName || "";
          }
        }

        // Some apps store teacher profiles separately.
        if (data.role === "teacher" && (
          requesterName === "Unknown" || !subject
        )) {
          const teacherSnapshot = await getDoc(
            doc(db, "teachers", data.userId)
          );

          if (teacherSnapshot.exists()) {
            const teacher = teacherSnapshot.data();

            requesterName =
              teacher.name ||
              teacher.fullName ||
              teacher.teacherName ||
              requesterName;

            subject =
              teacher.subject ||
              teacher.subjectName ||
              subject;
          }
        }
      } catch (error) {
        console.error(
          "[Leave] Failed to load requester details:",
          data.userId,
          error
        );
      }

      return {
        firestoreId: document.id,
        userId: data.userId,
        role: data.role,
        requesterName,
        studentName,
        className,
        section,
        rollNo,
        subject,
        leaveType: data.leaveType,
        reason: data.reason,
        description: data.description,
        fromDate: data.fromDate,
        toDate: data.toDate,
        attachmentUrl: data.attachmentUrl || "",
        status: data.status,
        createdAt: data.createdAt,
      };
    })
  );
  
  return requests.sort((a, b) => {
  const dateA = a.createdAt?.toMillis?.() ?? 0;
  const dateB = b.createdAt?.toMillis?.() ?? 0;

  return dateB - dateA;
});
};


export const saveLeaveRequest = async (
  userId: string,
  role: "parent" | "teacher",
  leaveType: string,
  description: string,
  fromDate: string,
  toDate: string,
  attachmentUrl: string = ""
) => {
  if (!userId) throw new Error("User not logged in.");
  if (!leaveType) throw new Error("Please select a leave type.");
  if (!description.trim()) throw new Error("Please enter a reason.");
  if (!fromDate || !toDate) {
    throw new Error("Please select both leave dates.");
  }
  if (fromDate > toDate) {
    throw new Error("End date cannot be before start date.");
  }

  await addDoc(collection(db, "leaveRequests"), {
    userId,
    role,
    leaveType,
    description: description.trim(),
    fromDate,
    toDate,
    attachmentUrl,
    status: "Pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  console.log("[Leave] Request submitted:", { userId, role });
};

export const updateLeaveStatus = async (
  firestoreId: string,
  status: string
) => {
  if (!["Approved", "Rejected"].includes(status)) {
    throw new Error("Invalid leave status.");
  }

  const leaveRef = doc(db, "leaveRequests", firestoreId);
  const leaveSnapshot = await getDoc(leaveRef);

  if (!leaveSnapshot.exists()) {
    throw new Error("Leave request not found.");
  }

  const leave = leaveSnapshot.data();

  await updateDoc(leaveRef, {
    status,
    updatedAt: serverTimestamp(),
  });

  // Parent notifications use the student's ID in the existing app.
  if (leave.role === "parent" && leave.userId) {
    try {
      const userSnapshot = await getDoc(
        doc(db, "users", leave.userId)
      );

      const studentId = userSnapshot.exists()
        ? userSnapshot.data().studentId
        : null;

      if (studentId) {
        await saveNotification(
          String(studentId),
          `Leave Request ${status}`,
          `Your ${leave.leaveType} leave request from ${leave.fromDate} to ${leave.toDate} has been ${status.toLowerCase()}.`,
          "Leave"
        );

        console.log("[Leave] Parent notified:", studentId);
      } else {
        console.warn(
          "[Leave] No studentId found for parent:",
          leave.userId
        );
      }
    } catch (error) {
      // The status is already saved; notification failure
      // should not make the status update appear unsuccessful.
      console.error("[Leave] Parent notification failed:", error);
    }
  }
};
