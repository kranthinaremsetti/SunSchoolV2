import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase/firebaseConfig";
import { getAttendanceRecords } from "../../services/attendanceService";

export default function AttendanceScreen() {
  interface AttendanceRecord {
  firestoreId: string;
  studentId: string;
  date: string;
  status: string;
}

const [studentAttendance, setStudentAttendance] =
useState<AttendanceRecord[]>([]);
  useEffect(() => {
    loadAttendance();
  }, []);
const [loading, setLoading] = useState(true);
  const loadAttendance = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      const userSnap = await getDoc(doc(db, "users", uid));

      if (!userSnap.exists()) return;

      const user: any = userSnap.data();

      const attendance = await getAttendanceRecords();

      const filtered = attendance.filter(
        (item) => item.studentId === user.studentId
      );

      setStudentAttendance(filtered);

    } catch (error) {
      console.log(error);
    }
  };

  const totalDays = studentAttendance.length;

  const presentDays = studentAttendance.filter(
    (item) => item.status === "Present"
  ).length;

  const absentDays = totalDays - presentDays;

  const attendancePercentage =
    totalDays === 0
      ? 0
      : Math.round((presentDays / totalDays) * 100);
  if (loading) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Loading...</Text>
    </View>
  );
}
  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        Attendance
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          Attendance : {attendancePercentage}%
        </Text>

        <Text style={styles.summaryText}>
          Present : {presentDays}
        </Text>

        <Text style={styles.summaryText}>
          Absent : {absentDays}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Attendance History
      </Text>

      {studentAttendance.length === 0 ? (
  <Text
    style={{
      textAlign: "center",
      color: "gray",
      marginTop: 20,
    }}
  >
    No attendance records found.
  </Text>
) : (
  studentAttendance.map((item) => (
    <View
      key={item.firestoreId}
      style={styles.historyCard}
    >
      <Text>{item.date}</Text>

      <Text
        style={{
          color:
            item.status === "Present"
              ? "green"
              : "red",
          fontWeight: "bold",
        }}
      >
        {item.status}
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

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  summaryCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },

  summaryText: {
    fontSize: 18,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  historyCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});