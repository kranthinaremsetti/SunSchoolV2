
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import { getResultsByStudent, Result } from "../../services/resultService";

const EXAM_OPTIONS = [
  "All Exams",
  "Unit Test 1",
  "Unit Test 2",
  "Mid Term",
  "Final Exam",
];

const SUBJECT_OPTIONS = [
  "All Subjects",
  "Mathematics",
  "Science",
  "English",
  "Social",
  "Computer",
];

export default function ResultsScreen() {
  const [studentResults, setStudentResults] = useState<Result[]>([]);
  const [selectedExam, setSelectedExam] = useState("All Exams");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [loading, setLoading] = useState(true);

  const loadResults = useCallback(async () => {
    setLoading(true);

    try {
      const uid = auth.currentUser?.uid;

      if (!uid) {
        setStudentResults([]);
        return;
      }

      const userSnap = await getDoc(doc(db, "users", uid));

      if (!userSnap.exists()) {
        setStudentResults([]);
        return;
      }

      const studentId = userSnap.data().studentId;

      if (typeof studentId !== "string" || !studentId) {
        setStudentResults([]);
        return;
      }

      const results = await getResultsByStudent(studentId);
setStudentResults(results);
    } catch (error) {
      console.error("Results Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const filteredResults = useMemo(() => {
    return studentResults.filter((result) => {
      const matchesExam =
        selectedExam === "All Exams" || result.examType === selectedExam;

      const matchesSubject =
        selectedSubject === "All Subjects" ||
        result.subject === selectedSubject;

      return matchesExam && matchesSubject;
    });
  }, [studentResults, selectedExam, selectedSubject]);

  const totalObtained = filteredResults.reduce(
    (sum, result) => sum + Number(result.marks || 0),
    0
  );

  const totalMaximum = filteredResults.reduce(
    (sum, result) => sum + Number(result.maxMarks || 0),
    0
  );

  const percentage =
    totalMaximum > 0
      ? ((totalObtained / totalMaximum) * 100).toFixed(2)
      : "0.00";

  const passedSubjects = filteredResults.filter(
    (result) =>
      Number(result.maxMarks) > 0 &&
      (Number(result.marks) / Number(result.maxMarks)) * 100 >= 35
  ).length;

  const failedSubjects = filteredResults.length - passedSubjects;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>My Results</Text>
        <Text style={styles.subtitle}>
          Filter and review your examination performance.
        </Text>

        <View style={styles.filterCard}>
          <Text style={styles.label}>Filter by Examination</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedExam}
              onValueChange={setSelectedExam}
            >
              {EXAM_OPTIONS.map((exam) => (
                <Picker.Item key={exam} label={exam} value={exam} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Filter by Subject</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedSubject}
              onValueChange={setSelectedSubject}
            >
              {SUBJECT_OPTIONS.map((subject) => (
                <Picker.Item
                  key={subject}
                  label={subject}
                  value={subject}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Performance Summary</Text>
          <Text style={styles.summaryText}>
            Total Marks: {totalObtained} / {totalMaximum}
          </Text>
          <Text style={styles.summaryText}>Percentage: {percentage}%</Text>
          <Text style={styles.summaryText}>Passed: {passedSubjects}</Text>
          <Text style={styles.summaryText}>Failed: {failedSubjects}</Text>
          <Text style={styles.resultCount}>
            Results shown: {filteredResults.length}
          </Text>
        </View>

        {filteredResults.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptyText}>
              No results match the selected examination and subject. Try
              selecting All Exams and All Subjects.
            </Text>
          </View>
        ) : (
          filteredResults.map((result) => {
            const maxMarks = Number(result.maxMarks);
            const marks = Number(result.marks);
            const resultPercentage =
              maxMarks > 0 ? (marks / maxMarks) * 100 : 0;
            const passed = resultPercentage >= 35;

            return (
              <View key={result.firestoreId} style={styles.card}>
                <Text style={styles.subject}>📘 {result.subject}</Text>
                <Text style={styles.info}>📝 Exam: {result.examType}</Text>
                <Text style={styles.info}>
                  🎯 Marks: {marks} / {maxMarks}
                </Text>
                <Text style={styles.info}>
                  📈 Percentage: {resultPercentage.toFixed(1)}%
                </Text>
                <Text style={styles.info}>💬 Remarks:</Text>
                <Text style={styles.remarks}>
                  {result.remarks || "No remarks"}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: passed ? "#DCFCE7" : "#FEE2E2" },
                  ]}
                >
                  <Text
                    style={{
                      color: passed ? "#166534" : "#991B1B",
                      fontWeight: "bold",
                    }}
                  >
                    {passed ? "PASS" : "FAIL"}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 35,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 10,
    color: "#64748B",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
  },
  subtitle: {
    color: "#64748B",
    marginTop: 6,
    marginBottom: 18,
  },
  filterCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 18,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 5,
    marginTop: 5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  summaryCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0F172A",
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#334155",
  },
  resultCount: {
    marginTop: 5,
    color: "#2563EB",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  subject: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 5,
  },
  info: {
    marginTop: 7,
    fontSize: 15,
    color: "#444",
  },
  remarks: {
    marginTop: 4,
    fontStyle: "italic",
    color: "#64748B",
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  emptyCard: {
    backgroundColor: "white",
    padding: 22,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 8,
    lineHeight: 21,
  },
});
