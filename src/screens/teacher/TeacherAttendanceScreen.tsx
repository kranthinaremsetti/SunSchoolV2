import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { getStudents } from "../../services/studentService";
import { Picker } from "@react-native-picker/picker";
import { classesData } from "../../constants/classesData";
import { saveNotification } from "../../services/notificationService";
import {
  saveAttendance,
} from "../../services/attendanceService";
import { auth } from "../../firebase/firebaseConfig";

export default function TeacherAttendanceScreen() {
  const [studentsState, setStudentsState] =
  useState<any[]>([]);
 useEffect(() => {
  loadStudents();
}, [selectedClass]);
const loadStudents = async () => {
  const data = await getStudents();

  setStudentsState(
    data
      .filter(
        (student) =>
          student.className === selectedClass
      )
      .map((student) => ({
        ...student,
        present: true,
      }))
  );
};
  const [selectedClass, setSelectedClass] =
    useState("5th Class");

  const toggleAttendance = (id: number) => {
    setStudentsState(
      studentsState.map((student) =>
        student.id === id
          ? {
              ...student,
              present: !student.present,
            }
          : student
      )
    );
  };
const submitAttendance = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    for (const student of studentsState) {

      await saveAttendance(
        student.id,
        today,
        student.present ? "Present" : "Absent",
        auth.currentUser?.uid || ""
      );

      if (!student.present) {
        await saveNotification(
          student.id,
          "Attendance Alert",
          `You were absent on ${today}`
        );
      }
    }

    Alert.alert(
      "Success",
      "Attendance submitted successfully."
    );

  } catch (error) {
    console.log(error);
    Alert.alert(
      "Error",
      "Failed to submit attendance."
    );
  }
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Take Attendance
      </Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>
          Select Class
        </Text>

        <Picker
          selectedValue={selectedClass}
          onValueChange={(itemValue) =>
            setSelectedClass(itemValue)
          }
        >
          {classesData.map((className) => (
            <Picker.Item
              key={className}
              label={className}
              value={className}
            />
          ))}
        </Picker>

        <Text>
          Selected: {selectedClass}
        </Text>
      </View>

      <ScrollView>
        {studentsState.map((student) => (
          <TouchableOpacity
            key={student.id}
            style={[
              styles.studentItem,
              {
                backgroundColor: student.present
                  ? "#DCFCE7"
                  : "#FEE2E2",
              },
            ]}
            onPress={() =>
              toggleAttendance(student.id)
            }
          >
            <Text>
              {student.present ? "🟢" : "🔴"}{" "}
              {student.name}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={submitAttendance}
        >
          <Text style={styles.submitButtonText}>
            Submit Attendance
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },

  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },

  label: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
  },

  studentItem: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },

  submitButton: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});