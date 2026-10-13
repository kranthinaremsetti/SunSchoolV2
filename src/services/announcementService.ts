
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { saveNotification } from "./notificationService";

export const getAnnouncements = async () => {
  const snapshot = await getDocs(
    collection(db, "announcements")
  );

  return snapshot.docs.map((announcementDoc) => ({
    firestoreId: announcementDoc.id,
    ...(announcementDoc.data() as any),
  }));
};

export const saveAnnouncement = async (
  title: string,
  message: string,
  audience: string,
  priority: string
) => {
  const cleanTitle = title.trim();
  const cleanMessage = message.trim();

  if (!cleanTitle || !cleanMessage) {
    throw new Error("Announcement title and message are required.");
  }

  // Save the announcement first.
  await addDoc(collection(db, "announcements"), {
    title: cleanTitle,
    message: cleanMessage,
    audience,
    priority,
    createdAt: serverTimestamp(),
  });

  // Parent notifications are supported by the existing
  // studentId-based notification system.
  if (audience === "All" || audience === "Parents") {
    const approvedParentsQuery = query(
      collection(db, "users"),
      where("role", "==", "parent"),
      where("status", "==", "approved")
    );

    const parentsSnapshot = await getDocs(
      approvedParentsQuery
    );

    const notificationTasks = parentsSnapshot.docs
      .map((parentDoc) => {
        const parent = parentDoc.data();
        const studentId = parent.studentId;

        if (
          typeof studentId !== "string" ||
          !studentId.trim()
        ) {
          return null;
        }

        return saveNotification(
          studentId,
          `Announcement: ${cleanTitle}`,
          `${priority} - ${cleanMessage}`,
          "Announcements"
        );
      })
      .filter(
        (task): task is Promise<void> => task !== null
      );

    await Promise.all(notificationTasks);
  }
};
