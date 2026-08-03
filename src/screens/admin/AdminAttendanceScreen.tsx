import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { classesData } from "../../constants/classesData";
import { getAttendanceRecords } from "../../services/attendanceService";
import { getStudents } from "../../services/studentService";

import DateTimePicker from "@react-native-community/datetimepicker";
import { TouchableOpacity } from "react-native";

export default function AdminAttendanceScreen() {

  const [selectedClass, setSelectedClass] = useState("5");

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [attendanceList, setAttendanceList] = useState<any[]>([]);

  useEffect(() => {
    loadAttendance();
  }, [selectedClass, selectedDate]);

  const loadAttendance = async () => {
    try {
      const attendance = await getAttendanceRecords();
      const students = await getStudents();

      const report = attendance
        .map((record: any) => {
          const student = students.find(
            (s: any) => s.id === record.studentId
          );

          if (!student) return null;

          return {
            ...record,
            studentName: (student as any).studentName,
            rollNo: (student as any).rollNo || "-",
            className: (student as any).className,
          };
        })
        .filter(
          (item: any) =>
            item &&
            item.className === selectedClass &&
            item.date === selectedDate
        );

      setAttendanceList(report);

    } catch (error) {
      console.log(error);
    }
  };

  const present = attendanceList.filter(
    (s) => s.status === "Present"
  ).length;

  const absent = attendanceList.filter(
    (s) => s.status === "Absent"
  ).length;

  const percentage =
    attendanceList.length === 0
      ? 0
      : Math.round((present / attendanceList.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <Text style={styles.title}>
          Attendance Report
        </Text>

        <Text style={styles.label}>
          Select Class
        </Text>

        <Picker
          selectedValue={selectedClass}
          onValueChange={(value) =>
            setSelectedClass(value)
          }
        >
          {classesData.map((cls) => (
            <Picker.Item
              key={cls}
              label={cls}
              value={cls}
            />
          ))}
        </Picker>
        
        <Text style={styles.label}>
  Select Date
</Text>

<TouchableOpacity
  style={styles.dateButton}
  onPress={() => setShowDatePicker(true)}
>
  <Text>{selectedDate}</Text>
</TouchableOpacity>

{showDatePicker && (
  <DateTimePicker
    value={new Date(selectedDate)}
    mode="date"
    display="default"
    onChange={(event, date) => {
      setShowDatePicker(false);

      if (date) {
        setSelectedDate(
          date.toISOString().split("T")[0]
        );
      }
    }}
  />
)}
        {/* Date Picker */}
    {attendanceList.length === 0 ? (
  <Text style={styles.emptyText}>
    No attendance found.
  </Text>
) : (
  attendanceList.map((item) => (
    <View
      key={item.firestoreId}
      style={styles.card}
    >
      <View>
        <Text style={styles.studentName}>
          {item.studentName||item.name}
        </Text>

        <Text>
          Roll No : {item.rollNo}
        </Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              item.status === "Present"
                ? "#16A34A"
                : "#DC2626",
          },
        ]}
      >
        <Text style={styles.statusText}>
          {item.status}
        </Text>
      </View>
    </View>
  ))
)}
        {/* Attendance List */}

        {/* Summary */}
        <View style={styles.summaryCard}>
  <Text>
    Total Students : {attendanceList.length}
  </Text>

  <Text>
    Present : {present}
  </Text>

  <Text>
    Absent : {absent}
  </Text>

  <Text>
    Attendance : {percentage}%
  </Text>
</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },
  dateButton: {
  backgroundColor: "white",
  padding: 15,
  borderRadius: 10,
  marginBottom: 20,
  elevation: 2,
},

card: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "white",
  padding: 15,
  borderRadius: 10,
  marginBottom: 12,
  elevation: 2,
},

studentName: {
  fontSize: 17,
  fontWeight: "bold",
},

statusBadge: {
  paddingHorizontal: 15,
  paddingVertical: 6,
  borderRadius: 20,
},

statusText: {
  color: "white",
  fontWeight: "bold",
},

summaryCard: {
  backgroundColor: "#E8F5E9",
  padding: 18,
  borderRadius: 12,
  marginTop: 20,
},

emptyText: {
  textAlign: "center",
  fontSize: 16,
  color: "gray",
  marginTop: 30,
},
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
});