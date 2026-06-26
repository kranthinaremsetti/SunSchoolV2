import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import DashboardCard from "../../components/DashboardCard";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function AdminDashboard() {
  const navigation = useNavigation<any>();
  const logout = async () => {
  await signOut(auth);
  navigation.replace("Login");
};
  const [stats, setStats] = useState({
    pending: 0,
    students: 0,
    teachers: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const users = await getDocs(collection(db, "users"));

      let pending = 0;
      let teachers = 0;
      let parents = 0;

      users.forEach((doc) => {
        const data: any = doc.data();

        if (data.status === "pending") pending++;

        if (data.role === "teacher") teachers++;

        if (data.role === "parent") parents++;
      });

      setStats({
        pending,
        students: parents,
        teachers,
      });
    } catch (e) {
      console.log(e);
    }
  }
const handleLogout = async () => {
  await signOut(auth);
  navigation.reset({
    index: 0,
    routes: [{ name: "Login" }],
  });
};
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
  <Text style={styles.title}>Admin Dashboard</Text>

  <TouchableOpacity onPress={handleLogout}>
    <Text style={styles.logout}>Logout</Text>
  </TouchableOpacity>
</View>
        <View style={styles.header}>
          <Text style={styles.school}>
            Sun School
          </Text>

          <Text style={styles.welcome}>
            Welcome Admin 👋
          </Text>
        </View>

        <View style={styles.grid}>

          <DashboardCard
            title="Pending Registrations"
            count={stats.pending}
            onPress={() =>
              navigation.navigate("PendingRegistrations")
            }
          />

          <DashboardCard
  title="Students"
  count={stats.students}
  onPress={() =>
    navigation.navigate("StudentManagement")
  }
/>

          <DashboardCard
            title="Teachers"
            count={stats.teachers}
            onPress={() =>
              navigation.navigate("TeacherManagement")
            }
          />

          <DashboardCard
            title="Attendance"
          />

          <DashboardCard
            title="Homework"
          />

          <DashboardCard
            title="Results"
          />

         <DashboardCard
    title="Fees"
    onPress={() =>
        navigation.navigate("FeeManagement")
    }
/>

          <DashboardCard
  title="Announcements"
  onPress={() =>
    navigation.navigate("AdminAnnouncements")
  }
/>

          <DashboardCard
  title="Leave Requests"
  onPress={() =>
    navigation.navigate("LeaveRequests")
  }
/>

          <DashboardCard
    title="Holidays"
    onPress={() =>
        navigation.navigate("HolidayManagement")
    }
/>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  header: {
    backgroundColor: "#1565C0",
    padding: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
      flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
  },

  school: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  welcome: {
    fontSize: 20,
    color: "#fff",
    marginTop: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    padding: 15,
  },

title: {
  fontSize: 28,
  fontWeight: "bold",
},

logout: {
  color: "#1565C0",
  fontWeight: "bold",
  fontSize: 16,
},
});