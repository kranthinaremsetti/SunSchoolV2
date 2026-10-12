
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";

import { classesData } from "../../constants/classesData";
import { getStudents } from "../../services/studentService";
import { getResults } from "../../services/resultService";

type ResultItem = {
  firestoreId?: string;
  id?: string | number;
  studentId: string | number;
  studentName: string;
  rollNo: string | number;
  className: string;
  subject: string;
  examType: string;
  marks: number | string;
  maxMarks: number | string;
  remarks?: string;
};

const ALL = "All";

const normalizeClass = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/\b(class|grade)\b/g, "")
    .replace(/(\d+)(st|nd|rd|th)\b/g, "$1")
    .replace(/\s+/g, "")
    .trim();

const getPercentage = (result: ResultItem) => {
  const marks = Number(result.marks);
  const maxMarks = Number(result.maxMarks);

  if (
    !Number.isFinite(marks) ||
    !Number.isFinite(maxMarks) ||
    maxMarks <= 0
  ) {
    return 0;
  }

  return (marks / maxMarks) * 100;
};

const isPass = (result: ResultItem) => getPercentage(result) >= 35;

export default function AdminResultsScreen() {
  const [selectedClass, setSelectedClass] = useState(
    classesData[0] ?? "5"
  );
  const [selectedExam, setSelectedExam] = useState(ALL);
  const [selectedSubject, setSelectedSubject] = useState(ALL);
  const [selectedStatus, setSelectedStatus] = useState(ALL);
  const [searchText, setSearchText] = useState("");

  const [allResults, setAllResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadResults = useCallback(async () => {
    setErrorMessage("");

    try {
      const [resultData, students] = await Promise.all([
        getResults(),
        getStudents(),
      ]);

      const report: ResultItem[] = resultData
        .map((result: any) => {
          const student = students.find(
            (item: any) =>
              String(item.id) === String(result.studentId)
          );

          if (!student) return null;

          return {
            ...result,
            studentName:
              student.studentName ?? student.name ?? "Unknown Student",
            rollNo: student.rollNo ?? "-",
            className: student.className ?? "",
          };
        })
        .filter((item: ResultItem | null): item is ResultItem => item !== null);

      setAllResults(report);
    } catch (error) {
      console.error("Failed to load results:", error);
      setErrorMessage("Unable to load results. Please try again.");
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        await loadResults();
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  }, [loadResults]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadResults();
    } finally {
      setRefreshing(false);
    }
  };

  const classResults = useMemo(
    () =>
      allResults.filter(
        (result) =>
          normalizeClass(result.className) ===
          normalizeClass(selectedClass)
      ),
    [allResults, selectedClass]
  );

  const examOptions = useMemo(
    () =>
      [...new Set(classResults.map((item) => item.examType).filter(Boolean))]
        .sort(),
    [classResults]
  );

  const subjectOptions = useMemo(
    () =>
      [
        ...new Set(
          classResults
            .filter(
              (item) =>
                selectedExam === ALL || item.examType === selectedExam
            )
            .map((item) => item.subject)
            .filter(Boolean)
        ),
      ].sort(),
    [classResults, selectedExam]
  );

  const filteredResults = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return classResults.filter((item) => {
      const matchesExam =
        selectedExam === ALL || item.examType === selectedExam;

      const matchesSubject =
        selectedSubject === ALL || item.subject === selectedSubject;

      const matchesStatus =
        selectedStatus === ALL ||
        (selectedStatus === "Pass" && isPass(item)) ||
        (selectedStatus === "Fail" && !isPass(item));

      const matchesSearch =
        !query ||
        String(item.studentName).toLowerCase().includes(query) ||
        String(item.rollNo).toLowerCase().includes(query);

      return (
        matchesExam &&
        matchesSubject &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    classResults,
    selectedExam,
    selectedSubject,
    selectedStatus,
    searchText,
  ]);

  const passCount = filteredResults.filter(isPass).length;
  const failCount = filteredResults.length - passCount;

  const average =
    filteredResults.length === 0
      ? "0.0"
      : (
          filteredResults.reduce(
            (sum, item) => sum + getPercentage(item),
            0
          ) / filteredResults.length
        ).toFixed(1);

  const changeClass = (value: string) => {
    setSelectedClass(value);
    setSelectedExam(ALL);
    setSelectedSubject(ALL);
    setSelectedStatus(ALL);
    setSearchText("");
  };

  const changeExam = (value: string) => {
    setSelectedExam(value);
    setSelectedSubject(ALL);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
      >
        <Text style={styles.title}>Results Report</Text>
        <Text style={styles.subtitle}>
          Filter and review student academic performance.
        </Text>

        <View style={styles.filterCard}>
          <Text style={styles.label}>Class</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedClass}
              onValueChange={changeClass}
            >
              {classesData.map((cls) => (
                <Picker.Item
                  key={cls}
                  label={cls}
                  value={cls}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Exam</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedExam}
              onValueChange={changeExam}
            >
              <Picker.Item label="All Exams" value={ALL} />
              {examOptions.map((exam) => (
                <Picker.Item key={exam} label={exam} value={exam} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Subject</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSubject}
              onValueChange={setSelectedSubject}
            >
              <Picker.Item label="All Subjects" value={ALL} />
              {subjectOptions.map((subject) => (
                <Picker.Item
                  key={subject}
                  label={subject}
                  value={subject}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Result Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <Picker.Item label="All Results" value={ALL} />
              <Picker.Item label="Pass" value="Pass" />
              <Picker.Item label="Fail" value="Fail" />
            </Picker>
          </View>

          <Text style={styles.label}>Search Student</Text>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Enter student name or roll number"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>

        <Text style={styles.sectionTitle}>Performance Summary</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Results</Text>
            <Text style={styles.summaryValue}>
              {filteredResults.length}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Passed</Text>
            <Text style={[styles.summaryValue, { color: "#16A34A" }]}>
              {passCount}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Failed</Text>
            <Text style={[styles.summaryValue, { color: "#DC2626" }]}>
              {failCount}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Average</Text>
            <Text style={styles.summaryValue}>{average}%</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={styles.loader}
          />
        ) : errorMessage ? (
          <View style={styles.emptyCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Text style={styles.retryText} onPress={handleRefresh}>
              Tap here to retry
            </Text>
          </View>
        ) : filteredResults.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptyText}>
              Try changing the filters or search term.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Student Results</Text>

            {filteredResults.map((item, index) => {
              const percentage = getPercentage(item);
              const passed = isPass(item);

              return (
                <View
                  key={
                    item.firestoreId ??
                    item.id?.toString() ??
                    `${item.studentId}-${item.subject}-${item.examType}-${index}`
                  }
                  style={styles.resultCard}
                >
                  <View style={styles.resultHeader}>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>
                        {item.studentName}
                      </Text>
                      <Text style={styles.mutedText}>
                        Roll No: {item.rollNo}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: passed ? "#DCFCE7" : "#FEE2E2",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: passed ? "#166534" : "#991B1B" },
                        ]}
                      >
                        {passed ? "PASS" : "FAIL"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <Text style={styles.detailText}>
                    Subject: {item.subject || "-"}
                  </Text>
                  <Text style={styles.detailText}>
                    Exam: {item.examType || "-"}
                  </Text>
                  <Text style={styles.detailText}>
                    Marks: {item.marks}/{item.maxMarks}
                  </Text>
                  <Text style={styles.detailText}>
                    Percentage: {percentage.toFixed(1)}%
                  </Text>
                  <Text style={styles.detailText}>
                    Remarks: {item.remarks || "-"}
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 5,
    marginBottom: 20,
  },
  filterCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 22,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginTop: 8,
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  summaryCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 13,
  },
  summaryValue: {
    color: "#0F172A",
    fontSize: 23,
    fontWeight: "bold",
    marginTop: 5,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 1,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  mutedText: {
    fontSize: 13,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 7,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#334155",
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
  },
  retryText: {
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 12,
    padding: 6,
  },
  loader: {
    marginVertical: 30,
  },
});
