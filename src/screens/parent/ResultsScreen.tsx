import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase/firebaseConfig";
import { getResults,Result } from "../../services/resultService";



export default function ResultsScreen() {
  const [studentResults, setStudentResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      // Logged-in user
      const userSnap = await getDoc(
        doc(db, "users", uid)
      );

      if (!userSnap.exists()) return;

      const user = userSnap.data() as {
        studentId: string;
      };

      // All results
      const results = await getResults();

      setStudentResults(
        results.filter(
          (result) =>
            result.studentId === user.studentId
        )
      );
    } catch (error) {
      console.log("Results Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  const totalObtained = studentResults.reduce(
  (sum, result) => sum + result.marks,
  0
);

const totalMaximum = studentResults.reduce(
  (sum, result) => sum + result.maxMarks,
  0
);

const percentage =
  totalMaximum > 0
    ? (
        (totalObtained / totalMaximum) *
        100
      ).toFixed(2)
    : "0";

const passedSubjects = studentResults.filter(
  (result) =>
    (result.marks / result.maxMarks) * 100 >= 35
).length;

const failedSubjects =
  studentResults.length - passedSubjects;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Results
      </Text>

      <View style={styles.summaryCard}>
  <Text style={styles.summaryText}>
    Total: {totalObtained} / {totalMaximum}
  </Text>

  <Text style={styles.summaryText}>
    Percentage: {percentage}%
  </Text>

  <Text style={styles.summaryText}>
    Passed: {passedSubjects}
  </Text>

  <Text style={styles.summaryText}>
    Failed: {failedSubjects}
  </Text>
</View>

      {studentResults.length === 0 ? (
        <Text style={styles.emptyText}>
          No results available.
        </Text>
      ) : (
        studentResults.map((result) => (
          <View
  key={result.firestoreId}
  style={styles.card}
>
  <Text style={styles.subject}>
    📘 {result.subject}
  </Text>

  <Text style={styles.info}>
    📝 Exam: {result.examType}
  </Text>

  <Text style={styles.info}>
    🎯 Marks: {result.marks} / {result.maxMarks}
  </Text>

  <Text style={styles.info}>
    📈 Percentage:{" "}
    {(
      (result.marks / result.maxMarks) *
      100
    ).toFixed(1)}
    %
  </Text>

  <Text style={styles.info}>
    💬 Remarks:
  </Text>

  <Text style={styles.remarks}>
    {result.remarks || "No remarks"}
  </Text>

  <Text
    style={{
      marginTop: 10,
      fontWeight: "bold",
      color:
        (result.marks / result.maxMarks) * 100 >=
        35
          ? "green"
          : "red",
    }}
  >
    {(result.marks / result.maxMarks) * 100 >= 35
      ? "🟢 PASS"
      : "🔴 FAIL"}
  </Text>
</View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  summaryCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },

  summaryText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },

  subject: {
    fontSize: 20,
    fontWeight: "bold",
  },

  marks: {
    fontSize: 18,
    marginTop: 8,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "gray",
  },
  info: {
  marginTop: 6,
  fontSize: 15,
  color: "#444",
},

remarks: {
  marginTop: 4,
  fontStyle: "italic",
  color: "#666",
},
});