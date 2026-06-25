import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase/firebaseConfig";
import { getLeaveRequests } from "../../services/leaveService";

export default function LeaveHistoryScreen() {
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);

  useEffect(() => {
    loadLeaveHistory();
  }, []);

  const loadLeaveHistory = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      const userSnap = await getDoc(
        doc(db, "users", uid)
      );

      if (!userSnap.exists()) return;

      const user: any = userSnap.data();

      const allLeaves = await getLeaveRequests();

      const filtered = allLeaves.filter(
  (leave) =>
    leave.userId === uid &&
    leave.role === "parent"
);

      setLeaveHistory(filtered);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Leave History
      </Text>

      {leaveHistory.length === 0 ? (
        <Text style={styles.empty}>
          No leave requests found.
        </Text>
      ) : (
        leaveHistory.map((leave) => (
          <View
  key={leave.firestoreId}
  style={styles.card}
>
  <Text style={styles.reason}>
    {leave.leaveType}
  </Text>

  <Text style={{ marginTop: 6 }}>
    {leave.description}
  </Text>

  <Text style={{ marginTop: 8 }}>
    {leave.fromDate} → {leave.toDate}
  </Text>

  <Text
    style={{
      color:
        leave.status === "Approved"
          ? "green"
          : leave.status === "Rejected"
          ? "red"
          : "#F59E0B",
      fontWeight: "bold",
      marginTop: 8,
    }}
  >
    {leave.status}
  </Text>
</View>
        ))
      )}
    </ScrollView>
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

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "gray",
    fontSize: 16,
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 15,
  },

  reason: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});