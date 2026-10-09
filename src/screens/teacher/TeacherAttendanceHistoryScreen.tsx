
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  TextInput
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";
import { getAttendanceRecords } from "../../services/attendanceService";
import { classesData } from "../../constants/classesData";
import { auth } from "../../firebase/firebaseConfig";
import { updateAttendanceStatus } from "../../services/attendanceService";

export default function TeacherAttendanceHistoryScreen() {
  const navigation = useNavigation<any>();

  const [records, setRecords] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState(classesData[0] || "");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
const [showDatePicker, setShowDatePicker] = useState(false);
const [filterDate, setFilterDate] = useState(new Date());
  const loadHistory = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getAttendanceRecords();
      setRecords(data);
    } catch (error) {
      console.error("Failed to load attendance history:", error);
      Alert.alert("Error", "Unable to load attendance history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleEditAttendance = (record: any) => {
  const newStatus =
    record.status === "Present" ? "Absent" : "Present";

  Alert.alert(
    "Edit Attendance",
    `Change this student's status from ${record.status} to ${newStatus}?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          const teacherUid = auth.currentUser?.uid;

          if (!teacherUid) {
            Alert.alert("Error", "Please log in again.");
            return;
          }

          
try {
  console.log(
    "updateAttendanceStatus type:",
    typeof updateAttendanceStatus
  );

  await updateAttendanceStatus(
    record.firestoreId,
    newStatus,
    teacherUid
  );

  await loadHistory();

  Alert.alert("Success", `Attendance changed to ${newStatus}.`);
} catch (error) {
  console.error("Edit attendance error:", error);
  Alert.alert(
    "Edit failed",
    error instanceof Error ? error.message : String(error)
  );
}

        },
      },
    ]
  );
};
  const filteredRecords = records.filter((record) => {
    const classMatches = record.className === selectedClass;
    const dateMatches =
      !selectedDate.trim() || record.date === selectedDate.trim();

    return classMatches && dateMatches;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Attendance History</Text>
      </View>

      <Text style={styles.label}>Class</Text>
      <View style={styles.pickerContainer}>
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
      </View>

      <Text style={styles.label}>Filter by date</Text>

<View style={styles.dateContainer}>
  <TouchableOpacity
    style={styles.dateInput}
    onPress={() => setShowDatePicker(true)}
  >
    <Text>
      {selectedDate || "All dates"}
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setSelectedDate("")}
  >
    <Text style={styles.clearButton}>Clear</Text>
  </TouchableOpacity>
</View>

{showDatePicker && (
  <DateTimePicker
    value={filterDate}
    mode="date"
    display={Platform.OS === "ios" ? "spinner" : "default"}
    onChange={(event, date) => {
      setShowDatePicker(Platform.OS === "ios");

      if (date) {
        setFilterDate(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        setSelectedDate(`${year}-${month}-${day}`);
      }
    }}
  />
)}

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.firestoreId}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No attendance records found for this class and date.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.studentName}>
                Student ID: {item.studentId}
              </Text>
              <Text>Date: {item.date}</Text>
              <Text>Period: {item.period || "Legacy record"}</Text>
              <Text>Class: {item.className || "Not recorded"}</Text>
              <Text
                style={[
                  styles.status,
                  item.status === "Present"
                    ? styles.present
                    : styles.absent,
                ]}
              >
                {item.status}

              </Text>
              <TouchableOpacity
  style={styles.editButton}
  onPress={() => handleEditAttendance(item)}
>
  <Text style={styles.editButtonText}>Edit Status</Text>
</TouchableOpacity>

{Array.isArray(item.editHistory) && item.editHistory.length > 0 && (
  <View style={styles.editHistory}>
    <Text style={styles.historyTitle}>Edit History</Text>

    {item.editHistory.map((entry: any, index: number) => (
      <Text key={`${item.firestoreId}-${index}`} style={styles.historyText}>
        {entry.oldStatus} → {entry.newStatus} ·{" "}
        {new Date(entry.editedAt).toLocaleString()}
      </Text>
    ))}
  </View>
)}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  backButton: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flexShrink: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 10,
  },
  dateHint: {
    color: "#374151",
  },
  clearButton: {
    color: "#2563EB",
    fontWeight: "600",
  },
  helper: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
  },
  loader: {
    marginTop: 30,
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  status: {
    fontWeight: "bold",
    marginTop: 8,
  },
  present: {
    color: "#15803D",
  },
  absent: {
    color: "#DC2626",
  },
  dateInput: {
  flex: 1,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 12,
  justifyContent: "center",
},
editButton: {
  backgroundColor: "#2563EB",
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 8,
  alignSelf: "flex-start",
  marginTop: 12,
},
editButtonText: {
  color: "#FFFFFF",
  fontWeight: "600",
},
editHistory: {
  marginTop: 12,
  padding: 10,
  backgroundColor: "#F3F4F6",
  borderRadius: 8,
},
historyTitle: {
  fontWeight: "700",
  marginBottom: 6,
},
historyText: {
  fontSize: 12,
  marginBottom: 4,
  color: "#444",
},
});
