
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";

import {
  getLeaveRequests,
  updateLeaveStatus,
} from "../../services/leaveService";

type LeaveRequest = {
  firestoreId: string;
  userId: string;
  role: "parent" | "teacher";
  requesterName: string;
  studentName: string;
  className: string;
  section: string;
  rollNo: string;
  subject: string;
  leaveType: string;
  description: string;
  fromDate: string;
  toDate: string;
  attachmentUrl: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt?: {
    toMillis?: () => number;
  } | null;
};

export default function LeaveRequestsScreen() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    const data = await getLeaveRequests();
    setRequests(data as LeaveRequest[]);
  }, []);

  useEffect(() => {
    loadRequests().catch((error) => {
      console.error("[Leave] Failed to load requests:", error);
      Alert.alert("Error", "Could not load leave requests.");
    });
  }, [loadRequests]);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await loadRequests();
    } catch (error) {
      console.error("[Leave] Refresh failed:", error);
      Alert.alert("Error", "Could not refresh leave requests.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: "Approved" | "Rejected"
  ) => {
    setUpdatingId(id);

    try {
      await updateLeaveStatus(id, status);
      await loadRequests();

      Alert.alert(
        "Success",
        status === "Approved"
          ? "Leave request approved."
          : "Leave request rejected."
      );
    } catch (error: any) {
      console.error("[Leave] Status update failed:", error);
      Alert.alert(
        "Error",
        error?.message || "Could not update the leave request."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = requests
    .filter((item) => {
      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesRole =
        roleFilter === "All" || item.role === roleFilter;

      return matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() ?? 0;
      const dateB = b.createdAt?.toMillis?.() ?? 0;
      return dateB - dateA;
    });

  const renderRequest = ({ item }: { item: LeaveRequest }) => (
    <View style={styles.card}>
      <Text style={styles.title}>
        {item.role === "teacher"
          ? "Teacher Leave Request"
          : "Student Leave Request"}
      </Text>

      {item.role === "teacher" ? (
        <>
          <Text style={styles.detail}>
            Teacher: {item.requesterName || "Not available"}
          </Text>
          <Text style={styles.detail}>
            Subject: {item.subject || "Not available"}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.detail}>
            Parent: {item.requesterName || "Not available"}
          </Text>
          <Text style={styles.detail}>
            Student: {item.studentName || "Not available"}
          </Text>
          <Text style={styles.detail}>
            Class: {item.className || "—"}
            {item.section ? ` - ${item.section}` : ""}
          </Text>
          <Text style={styles.detail}>
            Roll No: {item.rollNo || "—"}
          </Text>
        </>
      )}

      <View style={styles.divider} />

      <Text style={styles.detail}>Leave Type: {item.leaveType}</Text>
      <Text style={styles.detail}>From: {item.fromDate}</Text>
      <Text style={styles.detail}>To: {item.toDate}</Text>

      <Text style={styles.descriptionLabel}>Reason / Description</Text>
      <Text style={styles.description}>
        {item.description || "No description provided."}
      </Text>

      {item.attachmentUrl ? (
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(item.attachmentUrl).catch(() => {
              Alert.alert("Error", "Could not open the attachment.");
            });
          }}
        >
          <Text style={styles.attachment}>
            View Supporting Document
          </Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text
          style={[
            styles.statusBadge,
            item.status === "Pending" && styles.pendingBadge,
            item.status === "Approved" && styles.approvedBadge,
            item.status === "Rejected" && styles.rejectedBadge,
          ]}
        >
          {item.status}
        </Text>
      </View>

      {item.status === "Pending" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.approve,
              updatingId === item.firestoreId && styles.disabledButton,
            ]}
            disabled={updatingId === item.firestoreId}
            onPress={() =>
              handleStatusUpdate(item.firestoreId, "Approved")
            }
          >
            <Text style={styles.buttonText}>
              {updatingId === item.firestoreId ? "Please wait..." : "Approve"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.reject,
              updatingId === item.firestoreId && styles.disabledButton,
            ]}
            disabled={updatingId === item.firestoreId}
            onPress={() =>
              handleStatusUpdate(item.firestoreId, "Rejected")
            }
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Leave Requests</Text>
        <Text style={styles.total}>
          {filteredRequests.length} request(s)
        </Text>
      </View>

      
<View style={styles.filters}>
  <View style={styles.filterBox}>
    <Text style={styles.filterLabel}>FILTER BY STATUS</Text>
    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={statusFilter}
        onValueChange={setStatusFilter}
        style={styles.picker}
        dropdownIconColor="#2563EB"
      >
        <Picker.Item label="All Statuses" value="All" />
        <Picker.Item label="Pending" value="Pending" />
        <Picker.Item label="Approved" value="Approved" />
        <Picker.Item label="Rejected" value="Rejected" />
      </Picker>
    </View>
  </View>

  <View style={styles.filterBox}>
    <Text style={styles.filterLabel}>FILTER BY REQUESTER</Text>
    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={roleFilter}
        onValueChange={setRoleFilter}
        style={styles.picker}
        dropdownIconColor="#2563EB"
      >
        <Picker.Item label="Everyone" value="All" />
        <Picker.Item
          label="Students / Parents"
          value="parent"
        />
        <Picker.Item label="Teachers" value="teacher" />
      </Picker>
    </View>
  </View>
</View>


      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.firestoreId}
        renderItem={renderRequest}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No leave requests match these filters.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  total: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  
filters: {
  paddingHorizontal: 15,
  paddingTop: 8,
  paddingBottom: 12,
  gap: 12,
  backgroundColor: "#F1F5F9",
},

filterBox: {
  backgroundColor: "#FFFFFF",
  borderRadius: 14,
  paddingHorizontal: 12,
  paddingTop: 10,
  paddingBottom: 4,
  borderWidth: 1,
  borderColor: "#CBD5E1",
  borderLeftWidth: 4,
  borderLeftColor: "#2563EB",
},

filterLabel: {
  fontSize: 11,
  fontWeight: "800",
  color: "#64748B",
  letterSpacing: 1,
  marginBottom: 4,
},

pickerWrapper: {
  minHeight: 52,
  justifyContent: "center",
},

picker: {
  height: 54,
  width: "100%",
  color: "#1E293B",
  marginLeft: -6,
},

  listContent: {
    padding: 15,
    paddingTop: 5,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 10,
  },
  detail: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginTop: 8,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  attachment: {
    color: "#2563EB",
    marginTop: 12,
    fontWeight: "bold",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  statusLabel: {
    fontWeight: "600",
    color: "#334155",
  },
  statusBadge: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontWeight: "700",
    color: "#334155",
    backgroundColor: "#E2E8F0",
  },
  pendingBadge: {
    color: "#92400E",
    backgroundColor: "#FEF3C7",
  },
  approvedBadge: {
    color: "#166534",
    backgroundColor: "#DCFCE7",
  },
  rejectedBadge: {
    color: "#991B1B",
    backgroundColor: "#FEE2E2",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
  },
  approve: {
    backgroundColor: "#15803D",
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  reject: {
    backgroundColor: "#DC2626",
    flex: 1,
    marginLeft: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#64748B",
  },
});
