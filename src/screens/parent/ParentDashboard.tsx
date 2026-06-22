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

import { auth, db } from "../../firebase/firebaseConfig";

export default function ParentDashboard() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);

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
        setLoading(false);
        return;
      }

      const user: any = userSnap.data();
      
    console.log("UID:", uid);

console.log("User:", user);

console.log("Student ID:", user.studentId);
      const studentSnap = await getDoc(
        doc(db, "students", user.studentId)
      );
      console.log("Student Exists:", studentSnap.exists());

if (studentSnap.exists()) {
  console.log(studentSnap.data());
}
      if (studentSnap.exists()) {
        setStudent({
          id: studentSnap.id,
          ...studentSnap.data(),
        });
      }

    } catch (e) {
      console.log(e);
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
            {student?.name || "Student"}
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
              92%
            </Text>
            <Text>Attendance</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              ₹5000
            </Text>
            <Text>Fees Due</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Text style={styles.notificationButtonText}>
            View Notifications 🔔
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