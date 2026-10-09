
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";
import { getStudents } from "../../services/studentService";
import {
  getAttendanceRecords,
  saveAttendance,
} from "../../services/attendanceService";
import { saveNotification } from "../../services/notificationService";
import { auth } from "../../firebase/firebaseConfig";
import { classesData } from "../../constants/classesData";
import { useNavigation } from "@react-navigation/native";
interface StudentAttendance {
  id: string;
  name: string;
  className: string;
  present: boolean;
}

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TeacherAttendanceScreen() {
  const [selectedClass, setSelectedClass] = useState(
    classesData[0] || ""
  );
  const [selectedPeriod, setSelectedPeriod] = useState("1");
  const [attendanceDate, setAttendanceDate] = useState(getToday());
  const [studentsState, setStudentsState] = useState<StudentAttendance[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigation = useNavigation<any>();
  const [showDatePicker, setShowDatePicker] = useState(false);
const [attendanceDateValue, setAttendanceDateValue] = useState(new Date());
  const loadStudents = useCallback(async () => {
    setLoading(true);

    try {
      const [allStudents, records] = await Promise.all([
        getStudents(),
        getAttendanceRecords(),
      ]);

      const filteredStudents: StudentAttendance[] = allStudents
        .filter(
          (student: any) =>
            student.className === selectedClass
        )
        .map((student: any) => {
          const existing = records.find(
            (record: any) =>
              record.studentId === student.id &&
              record.date === attendanceDate &&
              String(record.period ?? "1") === selectedPeriod &&
              record.className === selectedClass
          );

          return {
            id: student.id,
            name: student.name || student.studentName || "Unnamed Student",
            className: student.className,
            present: existing ? (existing as any).status === "Present" : true,
          };
        });

      setStudentsState(filteredStudents);

      const sessionExists = records.some(
        (record: any) =>
          record.date === attendanceDate &&
          record.className === selectedClass &&
          String(record.period ?? "1") === selectedPeriod
      );

      setSubmitted(sessionExists);
    } catch (error) {
      console.error("Failed to load attendance:", error);
      Alert.alert("Error", "Unable to load students or attendance.");
    } finally {
      setLoading(false);
    }
  }, [selectedClass, attendanceDate, selectedPeriod]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [loadStudents])
  );

  const toggleAttendance = (id: string) => {
    if (submitted || submitting) return;

    setStudentsState((prev) =>
      prev.map((student) =>
        student.id === id
          ? { ...student, present: !student.present }
          : student
      )
    );
  };

  const submitAttendance = async () => {
    if (submitted || submitting) {
      Alert.alert(
        "Already Submitted",
        "Attendance has already been submitted for this class, date and period."
      );
      return;
    }

    if (studentsState.length === 0) {
      Alert.alert("No Students", "There are no students in this class.");
      return;
    }

    const teacherUid = auth.currentUser?.uid;

    if (!teacherUid) {
      Alert.alert("Session Expired", "Please log in again.");
      return;
    }

    setSubmitting(true);

    try {
      for (const student of studentsState) {
        await saveAttendance(
  student.id,
  attendanceDate,
  student.present ? "Present" : "Absent",
  teacherUid,
  selectedPeriod,
  selectedClass
);

        if (!student.present) {
          await saveNotification(
            student.id,
            "Attendance Alert",
            `You were absent on ${attendanceDate}.`
          );
        }
      }

      // Mark submitted only after all records have been saved.
      setSubmitted(true);

      Alert.alert(
        "Success",
        "Attendance submitted successfully."
      );
    } catch (error: any) {
      console.error("Attendance submission failed:", error);

      // Reload because some students may already have been saved.
      await loadStudents();

      Alert.alert(
        "Submission Incomplete",
        error?.message ||
          "Some attendance records may have been saved. Reload and review before trying again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
  <Text style={styles.title}>Teacher Attendance</Text>

  <TouchableOpacity
    style={styles.historyButton}
    onPress={() => navigation.navigate("TeacherAttendanceHistory")}
  >
    <Text style={styles.historyButtonText}>History</Text>
  </TouchableOpacity>
</View>
        <Text style={styles.title}>Take Attendance</Text>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Select Class</Text>
          <Picker
            selectedValue={selectedClass}
            onValueChange={setSelectedClass}
          >
            {classesData.map((className) => (
              <Picker.Item
                key={className}
                label={className}
                value={className}
              />
            ))}
          </Picker>

          <Text style={styles.label}>Period</Text>
          <Picker
            selectedValue={selectedPeriod}
            onValueChange={setSelectedPeriod}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
              <Picker.Item
                key={period}
                label={`Period ${period}`}
                value={String(period)}
              />
            ))}
          </Picker>

          <Text style={styles.label}>Attendance Date</Text>

<TouchableOpacity
  style={styles.dateButton}
  onPress={() => setShowDatePicker(true)}
>
  <Text style={styles.dateButtonText}>
    {attendanceDate}
  </Text>
</TouchableOpacity>

{showDatePicker && (
  <DateTimePicker
    value={attendanceDateValue}
    mode="date"
    maximumDate={new Date()}
    display={Platform.OS === "ios" ? "spinner" : "default"}
    onChange={(event, date) => {
      setShowDatePicker(Platform.OS === "ios");

      if (date) {
        setAttendanceDateValue(date);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        setAttendanceDate(`${year}-${month}-${day}`);
      }
    }}
  />
)}
          <Text style={styles.helper}>
            Today's date is selected automatically.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            {submitted && (
              <View style={styles.notice}>
                <Text style={styles.noticeText}>
                  Attendance already exists for this class, date and period.
                  Editing will be added through Attendance History.
                </Text>
              </View>
            )}

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
                disabled={submitted || submitting}
                onPress={() => toggleAttendance(student.id)}
              >
                <Text>
                  {student.present ? "🟢" : "🔴"} {student.name}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.submitButton,
                (submitted || submitting) && styles.disabledButton,
              ]}
              disabled={submitted || submitting}
              onPress={submitAttendance}
            >
              <Text style={styles.submitButtonText}>
                {submitting
                  ? "Submitting..."
                  : submitted
                  ? "Attendance Already Submitted"
                  : "Submit Attendance"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 10,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingTop: 12,
  },
  dateText: {
    paddingHorizontal: 10,
    paddingTop: 6,
    fontSize: 16,
  },
  helper: {
    color: "#666",
    paddingHorizontal: 10,
    paddingTop: 4,
  },
  studentItem: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  notice: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  noticeText: {
    color: "#92400E",
  },
  submitButton: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
},
historyButton: {
  backgroundColor: "#2563EB",
  paddingHorizontal: 14,
  paddingVertical: 9,
  borderRadius: 8,
},
historyButtonText: {
  color: "#FFFFFF",
  fontWeight: "600",
},
dateButton: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 12,
  marginBottom: 12,
},
dateButtonText: {
  color: "#222",
  fontSize: 16,
},
});
