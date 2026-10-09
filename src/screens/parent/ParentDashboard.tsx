import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getStudentAttendance } from "../../services/attendanceService";
import { auth, db } from "../../firebase/firebaseConfig";
import { getStudentFees } from "../../services/feeService";
import { getStudentNotifications } from "../../services/notificationService";
export default function ParentDashboard() {
  const navigation = useNavigation<any>();
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [pendingFee, setPendingFee] = useState(0);
  useEffect(() => {
    loadStudent();
  }, []);

const loadStudent = async () => {
  try {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      setLoading(false);
      return;
    }

    const userSnap = await getDoc(doc(db, "users", uid));

    if (!userSnap.exists()) {
      console.log("User document not found");
      setLoading(false);
      return;
    }

    const user: any = userSnap.data();

    console.log("Parent UID:", uid);
    console.log("Student ID:", user.studentId);

    if (!user.studentId) {
      console.log("No student linked to this parent");
      setStudent(null);
      setLoading(false);
      return;
    }

    const studentSnap = await getDoc(
      doc(db, "students", user.studentId)
    );

    if (!studentSnap.exists()) {
      console.log("Student document not found:", user.studentId);
      setStudent(null);
      setLoading(false);
      return;
    }

    const studentData: any = {
      id: studentSnap.id,
      ...studentSnap.data(),
    };

    console.log("Student:", studentData);

    setStudent(studentData);

    // Attendance
    try {
      const attendance = await getStudentAttendance(studentData.id);

      const present = attendance.filter(
        (a: any) => a.status === "Present"
      ).length;

      const percentage =
        attendance.length === 0
          ? 0
          : Math.round(
              (present / attendance.length) * 100
            );

      setAttendancePercentage(percentage);
    } catch (error) {
      console.log("Attendance error:", error);
      setAttendancePercentage(0);
    }

    // Fees
    try {
      const fees = await getStudentFees(studentData.id);

      const pending = fees.reduce(
        (sum: number, fee: any) =>
          sum +
          Math.max(
            0,
            Number(fee.dueAmount || 0) -
              Number(fee.paidAmount || 0)
          ),
        0
      );

      setPendingFee(pending);
    } catch (error) {
      console.log("Fee error:", error);
      setPendingFee(0);
    }

    // Notifications
    try {
      const notifications =
        await getStudentNotifications(studentData.id);

      setNotificationCount(notifications.length);
    } catch (error) {
      console.log("Notification error:", error);
      setNotificationCount(0);
    }

  } catch (error) {
    console.log("Dashboard error:", error);
  } finally {
    setLoading(false);
  }
};

  const handleLogout = async () => {
    await signOut(auth);

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Parent Dashboard
          </Text>

          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>
              🚪 Logout
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.studentCard}>
          <Text style={styles.studentName}>
            {student?.studentName || student?.name || "Student"}
          </Text>

          <Text style={styles.studentInfo}>
            Class: {student?.className || "-"}
          </Text>

          <Text style={styles.studentInfo}>
            Roll No: {student?.rollNo || "-"}
          </Text>

          <Text style={styles.welcome}>
            Welcome to SunSchool 👋
          </Text>
        </View>

        <View style={styles.row}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {attendancePercentage}%
            </Text>
            <Text>Attendance</Text>
          </View>

          <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
          ₹{pendingFee}
        </Text>

        <Text>
          Fees Due
        </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Text style={styles.notificationButtonText}>
          🔔 Notifications ({notificationCount})
        </Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <DashboardButton
            title="📅 Attendance"
            screen="Attendance"
            navigation={navigation}
          />

          <DashboardButton
            title="👤 Profile"
            screen="Profile"
            navigation={navigation}
          />
        </View>

        <View style={styles.row}>
          <DashboardButton
            title="📢 Announcements"
            screen="Announcements"
            navigation={navigation}
          />

          <DashboardButton
            title="📚 Homework"
            screen="Homework"
            navigation={navigation}
          />
        </View>

        <View style={styles.row}>
          <DashboardButton
            title="💰 Fees"
            screen="Fees"
            navigation={navigation}
          />

          <DashboardButton
            title="🕒 Timetable"
            screen="Timetable"
            navigation={navigation}
          />
        </View>

        <View style={styles.row}>
          <DashboardButton
            title="📊 Results"
            screen="Results"
            navigation={navigation}
          />

          <DashboardButton
            title="📝 Leave"
            screen="LeaveRequest"
            navigation={navigation}
          />
        </View>

        <View style={styles.row}>
          <DashboardButton
            title="📋 Leave History"
            screen="LeaveHistory"
            navigation={navigation}
          />

          <DashboardButton
            title="📅 Holidays"
            screen="Holidays"
            navigation={navigation}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardButton({
  title,
  screen,
  navigation,
}: any) {
  return (
    <TouchableOpacity
      style={styles.dashboardCard}
      onPress={() => navigation.navigate(screen)}
    >
      <Text style={styles.dashboardText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8FAFC",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },

  logout: {
    color: "#1565C0",
    fontWeight: "bold",
    fontSize: 16,
  },

  studentCard: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 15,
  },

  studentName: {
    fontSize: 22,
    fontWeight: "bold",
  },

  studentInfo: {
    marginTop: 8,
    fontSize: 16,
    color: "gray",
  },

  welcome: {
    marginTop: 12,
    fontSize: 18,
    color: "#2563EB",
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dashboardCard: {
    backgroundColor: "white",
    width: "48%",
    height: 120,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    marginBottom: 15,
  },

  dashboardText: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },

  notificationButton: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  notificationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  summaryCard: {
    backgroundColor: "white",
    width: "48%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    marginBottom: 15,
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563EB",
  },
});