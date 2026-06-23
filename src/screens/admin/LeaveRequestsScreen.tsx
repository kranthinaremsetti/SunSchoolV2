import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import {
  getLeaveRequests,
  updateLeaveStatus,
} from "../../services/leaveService";

export default function LeaveRequestsScreen() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const data = await getLeaveRequests();
    setRequests(data);
  };

  const approve = async (id: string) => {
    await updateLeaveStatus(id, "Approved");
    Alert.alert("Success", "Leave Approved");
    loadRequests();
  };

  const reject = async (id: string) => {
    await updateLeaveStatus(id, "Rejected");
    Alert.alert("Success", "Leave Rejected");
    loadRequests();
  };

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.firestoreId}
      contentContainerStyle={{ padding: 15 }}
      ListEmptyComponent={
        <Text style={styles.empty}>
          No Leave Requests
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>

          <Text style={styles.title}>
            Student ID: {item.studentId}
          </Text>

          <Text>
            Reason: {item.reason}
          </Text>

          <Text>
            From: {item.fromDate}
          </Text>

          <Text>
            To: {item.toDate}
          </Text>

          <Text style={styles.status}>
            Status: {item.status}
          </Text>

          {item.status === "Pending" && (
            <View style={styles.row}>

              <TouchableOpacity
                style={styles.approve}
                onPress={() =>
                  approve(item.firestoreId)
                }
              >
                <Text style={styles.btnText}>
                  Approve
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reject}
                onPress={() =>
                  reject(item.firestoreId)
                }
              >
                <Text style={styles.btnText}>
                  Reject
                </Text>
              </TouchableOpacity>

            </View>
          )}

        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  status: {
    marginTop: 10,
    fontWeight: "bold",
    color: "#1565C0",
  },

  row: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
  },

  approve: {
    backgroundColor: "green",
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  reject: {
    backgroundColor: "red",
    flex: 1,
    marginLeft: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 18,
  },
});