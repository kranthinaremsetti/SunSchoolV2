import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { classesData } from "../../constants/classesData";
import { getStudents } from "../../services/studentService";
import { getResults } from "../../services/resultService";

export default function AdminResultsScreen() {
  const [selectedClass, setSelectedClass] = useState("5");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    loadResults();
  }, [selectedClass]);

  const loadResults = async () => {
    try {
      const resultData = await getResults();
      const students = await getStudents();

      const report = resultData
        .map((result: any) => {
          const student = students.find(
            (s: any) => s.id === result.studentId
          );

          if (!student) return null;

          return {
            ...result,
            studentName: (student as any).studentName,
            rollNo: (student as any).rollNo || "-",
            className: (student as any).className,
          };
        })
        .filter(
          (item: any) =>
            item && item.className === selectedClass
        );

      setResults(report);
    } catch (error) {
      console.log(error);
    }
  };

  const pass = results.filter(
    (r) => Number(r.marks) >= 35
  ).length;

  const fail = results.filter(
    (r) => Number(r.marks) < 35
  ).length;

  const average =
    results.length === 0
      ? 0
      : (
          results.reduce(
            (sum, r) =>
              sum +
              (Number(r.marks) / Number(r.maxMarks)) * 100,
            0
          ) / results.length
        ).toFixed(1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <Text style={styles.title}>Results Report</Text>

        <Text style={styles.label}>Select Class</Text>

        <Picker
          selectedValue={selectedClass}
          onValueChange={(value) =>
            setSelectedClass(value)
          }
        >
          {classesData.map((cls) => (
            <Picker.Item
              key={cls}
              label={cls}
              value={cls}
            />
          ))}
        </Picker>

        {results.length === 0 ? (
          <Text style={styles.emptyText}>
            No Results Found
          </Text>
        ) : (
          results.map((item) => (
            <View
            key={item.firestoreId}
            style={styles.card}
          >
              <Text style={styles.studentName}>
                {item.studentName}
              </Text>

              <Text>Roll No : {item.rollNo}</Text>

              <Text>Subject : {item.subject}</Text>

              <Text>Exam : {item.examType}</Text>

              <Text>
                Marks : {item.marks}/{item.maxMarks}
              </Text>

              <Text>
                Percentage :{" "}
                {(
                  (Number(item.marks) /
                    Number(item.maxMarks)) *
                  100
                ).toFixed(1)}
                %
              </Text>

              <Text>Remarks : {item.remarks}</Text>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      Number(item.marks) >= 35
                        ? "#16A34A"
                        : "#DC2626",
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {Number(item.marks) >= 35
                    ? "PASS"
                    : "FAIL"}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.summaryCard}>
          <Text>Total Results : {results.length}</Text>

          <Text>Pass : {pass}</Text>

          <Text>Fail : {fail}</Text>

          <Text>Average : {average}%</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },

  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },

  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  statusBadge: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    color: "white",
    fontWeight: "bold",
  },

  summaryCard: {
    backgroundColor: "#E8F5E9",
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    marginTop: 30,
  },
});