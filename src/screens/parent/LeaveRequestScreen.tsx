import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { saveLeaveRequest } from "../../services/leaveService";
import { Picker } from "@react-native-picker/picker";

export default function LeaveRequestScreen() {
  const [leaveType, setLeaveType] = useState("");
  const [description, setDescription] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const pickDocument = () => {
    Alert.alert(
      "Coming Soon",
      "Document upload will be available in a future update."
    );
  };

  const submitLeave = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      const userSnap = await getDoc(doc(db, "users", uid));

      if (!userSnap.exists()) {
        Alert.alert("User not found");
        return;
      }

      await saveLeaveRequest(
        uid,
        "parent",
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
      console.log(error);
      Alert.alert(
        "Error",
        error.message || "Failed to submit leave request."
      );
    }
  };

  return (
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

      <TextInput
        style={styles.input}
        placeholder="From Date (YYYY-MM-DD)"
        value={fromDate}
        onChangeText={setFromDate}
      />

      <TextInput
        style={styles.input}
        placeholder="To Date (YYYY-MM-DD)"
        value={toDate}
        onChangeText={setToDate}
      />

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
});