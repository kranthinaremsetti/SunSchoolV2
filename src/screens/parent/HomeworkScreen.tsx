
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";

import { auth, db } from "../../firebase/firebaseConfig";
import {
  getHomework,
  Homework,
} from "../../services/homeworkService";

export default function HomeworkScreen() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set()
  );
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getCompletionDocumentId = (
    currentStudentId: string,
    homeworkId: string
  ) => `${currentStudentId}_${homeworkId}`;

  const loadHomework = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const uid = auth.currentUser?.uid;

      if (!uid) {
        setHomework([]);
        setCompletedIds(new Set());
        setStudentId("");
        return;
      }

      const userSnap = await getDoc(doc(db, "users", uid));

      if (!userSnap.exists()) {
        setHomework([]);
        return;
      }

      const userData = userSnap.data();
      const linkedStudentId = userData.studentId;

      if (
        typeof linkedStudentId !== "string" ||
        !linkedStudentId
      ) {
        setHomework([]);
        setCompletedIds(new Set());
        setStudentId("");
        return;
      }

      const studentSnap = await getDoc(
        doc(db, "students", linkedStudentId)
      );

      if (!studentSnap.exists()) {
        setHomework([]);
        return;
      }

      setStudentId(linkedStudentId);

      const studentData = studentSnap.data();
      const allHomework = await getHomework();
      const today = getTodayDate();

      // Keep only this student's class and hide expired assignments.
      const activeHomework = allHomework
        .filter(
          (item) =>
            item.className === String(studentData.className) &&
            /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate) &&
            item.dueDate >= today
        )
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

      // Completion is tracked independently for each student.
      
      // Completion is tracked independently for each student.
      const completionResults = await Promise.all(
        activeHomework.map(async (item) => {
          const completionId = getCompletionDocumentId(
            linkedStudentId,
            item.firestoreId
          );

          const completionSnap = await getDoc(
            doc(db, "homeworkCompletions", completionId)
          );

          // Only mark it completed when completed is explicitly true.
          return completionSnap.exists() &&
            completionSnap.data().completed === true
            ? item.firestoreId
            : null;
        })
      );

      setCompletedIds(
        new Set(
          completionResults.filter(
            (id): id is string => id !== null
          )
        )
      );


      setHomework(activeHomework);
    } catch (error) {
      console.error("Homework loading error:", error);
      Alert.alert(
        "Error",
        "Unable to load homework. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHomework();
    }, [])
  );

  const markCompleted = async (item: Homework) => {
    if (!studentId || completingId) {
      return;
    }

    if (completedIds.has(item.firestoreId)) {
      return;
    }

    try {
      setCompletingId(item.firestoreId);

      const completionId = getCompletionDocumentId(
        studentId,
        item.firestoreId
      );

      await setDoc(
        doc(db, "homeworkCompletions", completionId),
        {
          studentId,
          homeworkId: item.firestoreId,
          subject: item.subject,
          completed: true,
          completedAt: serverTimestamp(),
        }
      );

      setCompletedIds((previous) => {
        const updated = new Set(previous);
        updated.add(item.firestoreId);
        return updated;
      });

      Alert.alert(
        "🎉 Amazing Work!",
        "You completed your homework! Keep learning and keep shining! 🌟",
        [{ text: "Thank You! 🎉" }]
      );
    } catch (error) {
      console.error("Failed to mark homework completed:", error);
      Alert.alert(
        "Error",
        "Could not save your completion. Please try again."
      );
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1565C0" />
        <Text style={styles.loadingText}>Loading your homework...</Text>
      </SafeAreaView>
    );
  }

  const completedCount = homework.filter((item) =>
    completedIds.has(item.firestoreId)
  ).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadHomework(false)}
          />
        }
      >
        <Text style={styles.title}>My Homework 📚</Text>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            Keep up the great work! 🌟
          </Text>
          <Text style={styles.progressText}>
            {completedCount} of {homework.length} active assignments
            completed
          </Text>
        </View>

        {homework.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>You're all caught up!</Text>
            <Text style={styles.emptyText}>
              No active homework is due for your class right now.
            </Text>
          </View>
        ) : (
          homework.map((item) => {
            const isCompleted = completedIds.has(item.firestoreId);
            const isCompleting = completingId === item.firestoreId;

            return (
              <View
                key={item.firestoreId}
                style={[
                  styles.card,
                  isCompleted && styles.completedCard,
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.subject}>
                    📘 {item.subject}
                  </Text>

                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>
                        ✓ Done
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.task}>{item.task}</Text>

                <View style={styles.details}>
                  <Text style={styles.detailText}>
                    🏫 Class {item.className}
                  </Text>
                  <Text style={styles.detailText}>
                    📅 Due date: {item.dueDate}
                  </Text>
                </View>

                {isCompleted ? (
                  <View style={styles.successMessage}>
                    <Text style={styles.successText}>
                      🎉 Great job! Homework completed.
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.completeButton,
                      isCompleting && styles.disabledButton,
                    ]}
                    onPress={() => markCompleted(item)}
                    disabled={!!completingId}
                    accessibilityRole="button"
                    accessibilityLabel={`Mark ${item.subject} homework as completed`}
                  >
                    <Text style={styles.completeButtonText}>
                      {isCompleting
                        ? "Saving..."
                        : "✓ Mark as Completed"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 15,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 35,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 18,
  },
  progressCard: {
    backgroundColor: "#E0ECFF",
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1D4ED8",
  },
  progressText: {
    marginTop: 6,
    color: "#334155",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  completedCard: {
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  subject: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  task: {
    marginTop: 4,
    fontSize: 15,
    color: "#475569",
    lineHeight: 23,
  },
  details: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#64748B",
  },
  completeButton: {
    backgroundColor: "#16A34A",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  completedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  completedBadgeText: {
    color: "#15803D",
    fontWeight: "bold",
    fontSize: 12,
  },
  successMessage: {
    backgroundColor: "#DCFCE7",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  successText: {
    color: "#166534",
    fontWeight: "600",
    textAlign: "center",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 28,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  emptyEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#166534",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
});
