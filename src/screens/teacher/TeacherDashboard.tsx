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

export default function TeacherDashboard() {
  const navigation = useNavigation<any>();

  const [teacher, setTeacher] = useState<any>(null);

  useEffect(() => {
    loadTeacher();
  }, []);

  const loadTeacher = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      const teacherSnap = await getDoc(
        doc(db, "teachers", uid)
      );

      if (teacherSnap.exists()) {
        setTeacher({
          id: teacherSnap.id,
          ...teacherSnap.data(),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
  <Text style={styles.title}>
    Teacher Dashboard
  </Text>

  <TouchableOpacity onPress={handleLogout}>
    <Text style={styles.logout}>
      Logout
    </Text>
  </TouchableOpacity>
</View>

        {/* Teacher Card */}

        <View style={styles.teacherCard}>
          <Text style={styles.teacherName}>
            👨‍🏫 {teacher?.teacherName || "Teacher"}
          </Text>

          <Text style={styles.teacherInfo}>
            📚 Subject: {teacher?.subject || "-"}
          </Text>

          <Text style={styles.teacherInfo}>
            🎓 Qualification: {teacher?.qualification || "-"}
          </Text>

          <Text style={styles.teacherInfo}>
            💼 Experience: {teacher?.experience || "-"} Years
          </Text>
        </View>

        {/* Row 1 */}

        <View style={styles.row}>
          <DashboardButton
            title="📅 Attendance"
            screen="TeacherAttendance"
            navigation={navigation}
          />

          <DashboardButton
            title="👤 Profile"
            screen="TeacherProfile"
            navigation={navigation}
          />
        </View>

        {/* Row 2 */}

        <View style={styles.row}>
          <DashboardButton
            title="📊 Results"
            screen="TeacherResults"
            navigation={navigation}
          />

          <DashboardButton
            title="📝 Homework"
            screen="TeacherHomework"
            navigation={navigation}
          />
        </View>

        {/* Row 3 */}

        <View style={styles.row}>
          <DashboardButton
            title="📝 Apply Leave"
            screen="TeacherLeaveRequest"
            navigation={navigation}
          />

          <DashboardButton
            title="📄 Leave History"
            screen="TeacherLeaveHistory"
            navigation={navigation}
          />
        </View>

        {/* Row 4 */}

        <View style={styles.row}>
          <DashboardButton
            title="📢 Announcements"
            screen="TeacherAnnouncements"
            navigation={navigation}
          />

          <DashboardButton
            title="📅 Holidays"
            screen="TeacherHolidays"
            navigation={navigation}
          />
        </View>

        {/* Row 5 */}

        <TouchableOpacity
  style={styles.fullWidthCard}
  onPress={() => navigation.navigate("TeacherStudents")}
>
  <Text style={styles.cardText}>
    👥 Students
  </Text>
</TouchableOpacity>
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
      style={styles.card}
      onPress={() => navigation.navigate(screen)}
    >
      <Text style={styles.cardText}>
        {title}
      </Text>
    </TouchableOpacity>
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

  teacherCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },

  teacherName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1565C0",
  },

  teacherInfo: {
    fontSize: 16,
    color: "#555",
    marginTop: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "white",
    width: "48%",
    height: 120,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  fullWidthCard: {
  backgroundColor: "white",
  height: 80,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  elevation: 3,
  marginBottom: 15,
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
});