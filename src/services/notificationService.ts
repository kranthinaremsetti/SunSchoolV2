import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export type NotificationCategory =
  | "Attendance"
  | "Fees"
  | "Announcements"
  | "Homework"
  | "Results"
  | "Registration"
  | "Leave"
  | "General";

export interface Notification {
  firestoreId: string;
  studentId: string;
  title: string;
  message: string;
  category?: NotificationCategory;
  isRead?: boolean;
  createdAt?: any;
}

// Save an in-app notification for a student.
export const saveNotification = async (
  studentId: string,
  title: string,
  message: string,
  category: NotificationCategory = "General"
): Promise<void> => {
  console.log("[Notification] Starting write:", {
    studentId,
    title,
    category,
    signedIn: !!auth.currentUser,
  });

  if (!studentId?.trim() || !title.trim() || !message.trim()) {
    throw new Error("Student ID, title, and message are required.");
  }

  try {
    const notificationRef = await addDoc(
      collection(db, "notifications"),
      {
        studentId: studentId.trim(),
        title: title.trim(),
        message: message.trim(),
        category,
        isRead: false,
        createdAt: serverTimestamp(),
      }
    );

    console.log(
      "[Notification] Successfully created:",
      notificationRef.id
    );
  } catch (error) {
    console.error("[Notification] Firestore write failed:", error);
    throw error;
  }
};

// Sort newest notifications first.
// Handles both Firestore timestamps and missing timestamps.
const sortNewestFirst = (notifications: Notification[]) => {
  return notifications.sort((a, b) => {
    const timeA = a.createdAt?.toMillis?.() ?? 0;
    const timeB = b.createdAt?.toMillis?.() ?? 0;

    return timeB - timeA;
  });
};

// Get notifications belonging to one student.
export const getStudentNotifications = async (
  studentId: string
): Promise<Notification[]> => {
  if (!studentId) return [];

  const notificationsQuery = query(
    collection(db, "notifications"),
    where("studentId", "==", studentId)
  );

  const snapshot = await getDocs(notificationsQuery);

  const notifications = snapshot.docs.map((document) => {
    const data = document.data();

    return {
      firestoreId: document.id,
      studentId: data.studentId,
      title: data.title,
      message: data.message,
      category: data.category ?? "General",
      isRead: data.isRead ?? false,
      createdAt: data.createdAt,
    } as Notification;
  });

  return sortNewestFirst(notifications);
};

// Mark a single notification as read.
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  await updateDoc(
    doc(db, "notifications", notificationId),
    { isRead: true }
  );
};

// Mark all notifications for a student as read.
export const markAllNotificationsAsRead = async (
  studentId: string
): Promise<void> => {
  const notifications = await getStudentNotifications(studentId);

  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead
  );

  await Promise.all(
    unreadNotifications.map((notification) =>
      markNotificationAsRead(notification.firestoreId)
    )
  );
};

// Retained for compatibility with existing callers.
export const getNotifications = async (): Promise<Notification[]> => {
  const snapshot = await getDocs(collection(db, "notifications"));

  const notifications = snapshot.docs.map((document) => {
    const data = document.data();

    return {
      firestoreId: document.id,
      studentId: data.studentId,
      title: data.title,
      message: data.message,
      category: data.category ?? "General",
      isRead: data.isRead ?? false,
      createdAt: data.createdAt,
    } as Notification;
  });

  return sortNewestFirst(notifications);
};