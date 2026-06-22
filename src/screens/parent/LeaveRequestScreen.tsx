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

export default function LeaveRequestScreen() {
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const submitLeave = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      const userSnap = await getDoc(doc(db, "users", uid));

      if (!userSnap.exists()) {
        Alert.alert("User not found");
        return;
      }

      const user: any = userSnap.data();

      await saveLeaveRequest(
        user.studentId,
        reason,
        fromDate,
        toDate
      );

      Alert.alert(
        "Success",
        "Leave request submitted."
      );

      setReason("");
      setFromDate("");
      setToDate("");

    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        "Failed to submit leave request."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Leave Request
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Reason"
        value={reason}
        onChangeText={setReason}
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
        style={styles.button}
        onPress={submitLeave}
      >
        <Text style={styles.buttonText}>
          Submit
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

  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});