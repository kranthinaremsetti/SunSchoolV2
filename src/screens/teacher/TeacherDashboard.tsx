import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function TeacherDashboard() {
  const navigation = useNavigation<any>();
const handleLogout = async () => {
  await signOut(auth);
  navigation.reset({
    index: 0,
    routes: [{ name: "Login" }],
  });
};
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
  <Text style={styles.title}>Teacher Dashboard</Text>

  <TouchableOpacity onPress={handleLogout}>
    <Text style={styles.logout}>Logout</Text>
  </TouchableOpacity>
</View>
          <View style={styles.teacherCard}>
  <Text style={styles.teacherName}>
    👨‍🏫 Teacher
  </Text>

  <Text style={styles.teacherInfo}>
    Qualification: --
  </Text>

  <Text style={styles.teacherInfo}>
    Subject: --
  </Text>
</View>
    <View style={styles.row}>
  <View style={styles.summaryCard}>
    <Text style={styles.summaryValue}>
      35
    </Text>
    <Text>Students</Text>
  </View>

  <View style={styles.summaryCard}>
    <Text style={styles.summaryValue}>
      2
    </Text>
    <Text>Leave Requests</Text>
  </View>
</View>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate(
              "TeacherAttendance"
            )
          }
        >
          <Text style={styles.cardText}>
           📅 Attendance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate(
              "TeacherHomework"
            )
          }
        >
          <Text style={styles.cardText}>
            📝 Homework
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate(
              "TeacherAnnouncement"
            )
          }
        >
          <Text style={styles.cardText}>
            📢 Announcements
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate(
              "TeacherStudents"
            )
          }
        >
          <Text style={styles.cardText}>
            👥 Students
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
          <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate(
              "LeaveRequests"
            )
          }
        >
          <Text style={styles.cardText}>
            🕒 Leave Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate(
              "TeacherResults"
            )
          }
        >
          <Text style={styles.cardText}>
            📊 Results
          </Text>
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8FAFC",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
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
},

teacherInfo: {
  marginTop: 5,
  color: "gray",
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
header: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
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