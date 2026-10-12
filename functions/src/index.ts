
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions";

initializeApp();

const db = getFirestore();

setGlobalOptions({ maxInstances: 1 });

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(dateString: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null;
  }

  const date = new Date(`${dateString}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateString
  ) {
    return null;
  }

  return date;
}

export const previewFeeReminders = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please sign in.");
  }

  const userSnapshot = await db
    .collection("users")
    .doc(request.auth.uid)
    .get();

  if (
    !userSnapshot.exists ||
    userSnapshot.data()?.role !== "admin"
  ) {
    throw new HttpsError(
      "permission-denied",
      "Only administrators can preview fee reminders."
    );
  }

  const todayString =
    typeof request.data?.today === "string"
      ? request.data.today
      : new Date().toISOString().slice(0, 10);

  const today = parseDate(todayString);

  if (!today) {
    throw new HttpsError(
      "invalid-argument",
      "Date must use YYYY-MM-DD format."
    );
  }

  const feesSnapshot = await db.collection("fees").get();

  const reminders = feesSnapshot.docs.flatMap((feeDoc) => {
    const fee = feeDoc.data();
    const totalFee = Number(fee.totalFee ?? 0);
    const paidAmount = Number(fee.paidAmount ?? 0);
    const dueAmount = Math.max(0, totalFee - paidAmount);
    const dueDate = parseDate(String(fee.dueDate ?? ""));

    if (
      !fee.studentId ||
      !dueDate ||
      dueAmount <= 0 ||
      fee.status === "Paid"
    ) {
      return [];
    }

    const daysUntilDue = Math.round(
      (dueDate.getTime() - today.getTime()) / DAY_MS
    );

    if (daysUntilDue < 0 || daysUntilDue > 7) {
      return [];
    }

    return [{
      feeId: feeDoc.id,
      studentId: String(fee.studentId),
      feeType: String(fee.feeType ?? "School fee"),
      dueDate: String(fee.dueDate),
      daysUntilDue,
      outstandingAmount: dueAmount,
      message:
        `Your ${String(fee.feeType ?? "school fee")} has ` +
        `₹${dueAmount} outstanding. Due date: ${String(fee.dueDate)}.`,
    }];
  });

  return {
    today: todayString,
    count: reminders.length,
    reminders,
    mode: "preview-only",
  };
});
