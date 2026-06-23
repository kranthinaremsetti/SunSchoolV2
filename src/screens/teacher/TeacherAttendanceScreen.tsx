import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";

import { getStudents } from "../../services/studentService";
import { saveNotification } from "../../services/notificationService";
import { saveAttendance } from "../../services/attendanceService";
import { auth } from "../../firebase/firebaseConfig";
import { classesData } from "../../constants/classesData";

interface StudentAttendance {
  id: string;
  name: string;
  className: string;
  present: boolean;
}

export default function TeacherAttendanceScreen() {
  const [selectedClass, setSelectedClass] =
    useState("5th Class");

  const [studentsState, setStudentsState] =
    useState<StudentAttendance[]>([]);

  useEffect(() => {
    loadStudents();
  }, [selectedClass]);

  const loadStudents = async () => {
    try {
      const data = await getStudents();

      const filteredStudents: StudentAttendance[] =
        data
          .filter(
            (student: any) =>
              student.className === selectedClass
          )
          .map((student: any) => ({
            id: student.id,
            name: student.name,
            className: student.className,
            present: true,
          }));

      setStudentsState(filteredStudents);

    } catch (error) {
      console.log(error);
    }
  };

  const toggleAttendance = (id: string) => {
    setStudentsState((prev) =>
      prev.map((student) =>
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
      const today = new Date()
        .toISOString()
        .split("T")[0];

      for (const student of studentsState) {
        await saveAttendance(
          student.id,
          today,
          student.present
            ? "Present"
            : "Absent",
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
          onValueChange={(value) =>
            setSelectedClass(value)
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
                backgroundColor:
                  student.present
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