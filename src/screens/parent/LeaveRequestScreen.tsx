import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { saveLeaveRequest } from "../../services/leaveService";
import { Picker } from "@react-native-picker/picker";

export default function LeaveRequestScreen() {
  const [leaveType, setLeaveType] = useState("");
  const [description, setDescription] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFromPicker, setShowFromPicker] = useState(false);
const [showToPicker, setShowToPicker] = useState(false);

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDate = (value: string) => {
  if (!value) return new Date();

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};
  const pickDocument = () => {
    Alert.alert(
      "Coming Soon",
      "Document upload will be available in a future update."
    );
  };


const submitLeave = async () => {
  try {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      Alert.alert("Login Required", "Please log in again.");
      return;
    }

    const userSnap = await getDoc(doc(db, "users", uid));

    if (!userSnap.exists()) {
      Alert.alert("Error", "User not found.");
      return;
    }

    const userData = userSnap.data();
    const role = String(userData.role || "").toLowerCase();

    if (role !== "parent" && role !== "teacher") {
      Alert.alert(
        "Access Denied",
        "Only parents and teachers can submit leave requests."
      );
      return;
    }

    await saveLeaveRequest(
      uid,
      role,
      leaveType,
      description,
      fromDate,
      toDate,
      ""
    );

    Alert.alert(
      "Success",
      "Leave request submitted successfully."
    );

    setLeaveType("");
    setDescription("");
    setFromDate("");
    setToDate("");
  } catch (error: any) {
    console.error("[Leave] Submission failed:", error);
    Alert.alert(
      "Error",
      error.message || "Failed to submit leave request."
    );
  }
};

  return (
    
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>
          Leave Request
        </Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={leaveType}
          onValueChange={setLeaveType}
        >
          <Picker.Item
            label="Select Leave Type"
            value=""
          />
          <Picker.Item
            label="Sick Leave"
            value="Sick Leave"
          />
          <Picker.Item
            label="Medical Leave"
            value="Medical Leave"
          />
          <Picker.Item
            label="Casual Leave"
            value="Casual Leave"
          />
          <Picker.Item
            label="Emergency Leave"
            value="Emergency Leave"
          />
          <Picker.Item
            label="Personal Leave"
            value="Personal Leave"
          />
          <Picker.Item
            label="Other"
            value="Other"
          />
        </Picker>
      </View>

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Explain your leave..."
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity
  style={styles.dateButton}
  onPress={() => setShowFromPicker(true)}
>
  <Text style={styles.dateText}>
    📅 From Date: {fromDate || "Select start date"}
  </Text>
</TouchableOpacity>

{showFromPicker && (
  <DateTimePicker
    value={parseDate(fromDate)}
    mode="date"
    display={Platform.OS === "ios" ? "spinner" : "default"}
    minimumDate={new Date(2000, 0, 1)}
    onChange={(event, selectedDate) => {
      setShowFromPicker(Platform.OS === "ios");

      if (event.type === "dismissed" || !selectedDate) {
        setShowFromPicker(false);
        return;
      }

      const selected = formatDate(selectedDate);
      setFromDate(selected);

      if (toDate && toDate < selected) {
        setToDate("");
      }

      setShowFromPicker(false);
    }}
  />
)}

<TouchableOpacity
  style={styles.dateButton}
  onPress={() => setShowToPicker(true)}
>
  <Text style={styles.dateText}>
    📅 To Date: {toDate || "Select end date"}
  </Text>
</TouchableOpacity>

{showToPicker && (
  <DateTimePicker
    value={parseDate(toDate || fromDate)}
    mode="date"
    display={Platform.OS === "ios" ? "spinner" : "default"}
    minimumDate={fromDate ? parseDate(fromDate) : new Date(2000, 0, 1)}
    onChange={(event, selectedDate) => {
      setShowToPicker(Platform.OS === "ios");

      if (event.type === "dismissed" || !selectedDate) {
        setShowToPicker(false);
        return;
      }

      setToDate(formatDate(selectedDate));
      setShowToPicker(false);
    }}
  />
)}

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={pickDocument}
      >
        <Text style={styles.uploadText}>
          📎 Attach Supporting Document (Coming Soon)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={submitLeave}
      >
        <Text style={styles.buttonText}>
          Submit Leave Request
        </Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
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
    marginBottom: 20,
  },

  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },

  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },

  uploadButton: {
    backgroundColor: "#E5E7EB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  uploadText: {
    fontWeight: "bold",
    color: "#555",
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  dateButton: {
  backgroundColor: "white",
  padding: 16,
  borderRadius: 10,
  marginBottom: 15,
  elevation: 2,
  borderWidth: 1,
  borderColor: "#E5E7EB",
},

dateText: {
  fontSize: 16,
  color: "#374151",
},
});