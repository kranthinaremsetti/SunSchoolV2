
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { auth, db } from "../../firebase/firebaseConfig";
import DashboardCard from "../../components/DashboardCard";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";

export default function AdminDashboard() {
  const navigation = useNavigation<any>();

  const [stats, setStats] = useState({
    pending: 0,
    students: 0,
    teachers: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));

      let pending = 0;
      let teachers = 0;
      let parents = 0;

      snapshot.forEach((userDoc) => {
        const data = userDoc.data();

        if (data.status === "pending") pending++;
        if (data.role === "teacher" && data.status === "approved") {
          teachers++;
        }
        if (data.role === "parent" && data.status === "approved") {
          parents++;
        }
      });

      setStats({
        pending,
        students: parents,
        teachers,
      });
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            accessibilityRole="button"
          >
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.school}>Sun School</Text>
            <Text style={styles.welcome}>Welcome, Admin 👋</Text>
          </View>
          <Text style={styles.welcomeIcon}>✦</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.cardSlot}>
            <DashboardCard
              title="Pending Registrations"
              count={stats.pending}
              onPress={() => navigation.navigate("PendingRegistrations")}
            />
          </View>

          <View style={styles.cardSlot}>
            <DashboardCard
              title="Students"
              count={stats.students}
              onPress={() => navigation.navigate("StudentManagement")}
            />
          </View>

          <View style={styles.cardSlot}>
            <DashboardCard
              title="Teachers"
              count={stats.teachers}
              onPress={() => navigation.navigate("TeacherManagement")}
            />
          </View>

          <View style={styles.cardSlot}>
            <DashboardCard
              title="Attendance"
              onPress={() => navigation.navigate("AdminAttendance")}
            />
          </View>

          <View style={styles.cardSlot}>
            <DashboardCard
              title="Homework"
              onPress={() => navigation.navigate("AdminHomework")}
            />
          </View>

          <View style={styles.cardSlot}>
            <DashboardCard
              title="Results"
              onPress={() => navigation.navigate("AdminResults")}
            />
          </View>

          <View style={styles.cardSlot}>
            <DashboardCard
              title="Fees"
              onPress={() => navigation.navigate("FeeManagement")}
            />
          </View>

          <View style={styles.cardSlot}>
            <DashboardCard
              title="Announcements"
              onPress={() => navigation.navigate("AdminAnnouncements")}
            />
          </View>

          <View style={styles.cardSlot}>
            <DashboardCard
              title="Leave Requests"
              onPress={() => navigation.navigate("LeaveRequests")}
            />
          </View>

          <View style={styles.cardSlot}>
            <DashboardCard
              title="Holidays"
              onPress={() => navigation.navigate("HolidayManagement")}
            />
          </View>
        </View>

        <Text style={styles.footer}>Sun School · Admin Portal</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  header: {
    minHeight: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    flexShrink: 1,
    fontFamily: Fonts.bold,
    fontSize: 23,
    fontWeight: "700",
    color: Colors.secondary,
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logout: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    fontSize: 14,
  },
  welcomeCard: {
    minHeight: 160,
    backgroundColor: Colors.primary,
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  welcomeTextContainer: {
    flex: 1,
  },
  school: {
    fontFamily: Fonts.bold,
    fontSize: 30,
    fontWeight: "700",
    color: Colors.white,
  },
  welcome: {
    fontFamily: Fonts.regular,
    fontSize: 17,
    color: Colors.white,
    marginTop: 12,
  },
  welcomeIcon: {
    color: Colors.white,
    fontSize: 36,
    marginLeft: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "stretch",
  },
  cardSlot: {
    width: "48%",
    minHeight: 126,
    marginBottom: 14,
  },
  footer: {
    textAlign: "center",
    color: Colors.gray,
    fontSize: 12,
    marginTop: 4,
    paddingVertical: 10,
  },
});
