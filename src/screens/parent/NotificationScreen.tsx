import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, getDoc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";

import { auth, db } from "../../firebase/firebaseConfig";
import {
  getStudentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
  NotificationCategory,
} from "../../services/notificationService";

const CATEGORIES: Array<"All" | NotificationCategory> = [
  "All",
  "Attendance",
  "Fees",
  "Announcements",
  "Homework",
  "Results",
  "Registration",
  "Leave",
  "General",
];

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<"All" | NotificationCategory>("All");

  const loadNotifications = useCallback(async () => {
    setErrorMessage("");

    try {
      const uid = auth.currentUser?.uid;

      if (!uid) {
        setNotifications([]);
        setErrorMessage("Please log in again to view notifications.");
        return;
      }

      const userSnapshot = await getDoc(doc(db, "users", uid));

      if (!userSnapshot.exists()) {
        setNotifications([]);
        setErrorMessage("Your account details could not be found.");
        return;
      }

      const user = userSnapshot.data();
      const studentId = user.studentId;

      if (!studentId || user.status !== "approved") {
        setNotifications([]);
        setErrorMessage(
          "Your student account is not linked yet. Please contact the school administrator."
        );
        return;
      }

      const data = await getStudentNotifications(String(studentId));
      setNotifications(
  data.filter((notification) => !(notification.isRead ?? false))
);
    } catch (error) {
      console.error("Notification loading failed:", error);
      setErrorMessage("Unable to load notifications. Please try again.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);
        await loadNotifications();
        if (active) setLoading(false);
      };

      void load();

      return () => {
        active = false;
      };
    }, [loadNotifications])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadNotifications();
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkRead = async (item: Notification) => {
    if (item.isRead || markingRead) return;

    setMarkingRead(true);
    try {
      await markNotificationAsRead(item.firestoreId);

      setNotifications((previous) =>
  previous.filter(
    (notification) => notification.firestoreId !== item.firestoreId
  )
);
    } catch (error) {
      console.error("Mark notification as read failed:", error);
      Alert.alert("Error", "Unable to update this notification.");
    } finally {
      setMarkingRead(false);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadCount = notifications.filter(
      (item) => !item.isRead
    ).length;

    if (unreadCount === 0 || markingRead) return;

    setMarkingRead(true);
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) {
        Alert.alert("Session Expired", "Please log in again.");
        return;
      }

      const userSnapshot = await getDoc(doc(db, "users", uid));
      const studentId = userSnapshot.data()?.studentId;

      if (!studentId) {
        Alert.alert("Error", "Your student account is not linked.");
        return;
      }

      await markAllNotificationsAsRead(String(studentId));

      setNotifications([]);
    } catch (error) {
      console.error("Mark all notifications as read failed:", error);
      Alert.alert("Error", "Unable to mark all notifications as read.");
    } finally {
      setMarkingRead(false);
    }
  };

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const visibleNotifications =
    selectedCategory === "All"
      ? notifications
      : notifications.filter(
          (item) =>
            (item.category ?? "General") === selectedCategory
        );

  const formatDate = (value: unknown) => {
    const timestamp = value as { toDate?: () => Date } | undefined;

    if (!timestamp?.toDate) return "";

    return timestamp
      .toDate()
      .toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
      >
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          Attendance alerts and school updates
        </Text>

        {!loading && !errorMessage && notifications.length > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.unreadSummary}>
              {unreadCount} unread
            </Text>

            <TouchableOpacity
              onPress={handleMarkAllRead}
              disabled={unreadCount === 0 || markingRead}
            >
              <Text
                style={[
                  styles.markAllText,
                  unreadCount === 0 && styles.disabledText,
                ]}
              >
                {markingRead ? "Updating..." : "Mark All as Read"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !errorMessage && notifications.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroller}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category &&
                    styles.categoryChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category &&
                      styles.categoryTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={styles.loader}
          />
        ) : errorMessage ? (
          <View style={styles.emptyCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => void loadNotifications()}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : visibleNotifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {notifications.length === 0
                ? "You're all caught up!"
                : "No notifications in this category"}
            </Text>
            <Text style={styles.emptyText}>
              {notifications.length === 0
                ? "New school updates will appear here."
                : "Choose another category to see more notifications."}
            </Text>
          </View>
        ) : (
          visibleNotifications.map((item) => {
            const isRead = item.isRead ?? false;

            return (
              <View
                key={item.firestoreId}
                style={[
                  styles.card,
                  !isRead && styles.unreadCard,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.indicator,
                      isRead && styles.readIndicator,
                    ]}
                  />

                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>
                      {item.title}
                    </Text>
                    <Text style={styles.categoryLabel}>
                      {item.category ?? "General"}
                    </Text>
                  </View>

                  {!isRead && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>
                        NEW
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.message}>{item.message}</Text>

                {formatDate(item.createdAt) !== "" && (
                  <Text style={styles.dateText}>
                    {formatDate(item.createdAt)}
                  </Text>
                )}

                {!isRead && (
                  <TouchableOpacity
                    style={styles.markReadButton}
                    onPress={() => void handleMarkRead(item)}
                    disabled={markingRead}
                  >
                    <Text style={styles.markReadText}>
                      Mark as Read
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 5,
    marginBottom: 22,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  unreadSummary: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  markAllText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
  },
  disabledText: {
    color: "#94A3B8",
  },
  categoryScroller: {
    flexGrow: 0,
    marginBottom: 16,
  },
  categoryRow: {
    paddingRight: 8,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },
  categoryChipSelected: {
    backgroundColor: "#2563EB",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 1,
  },
  unreadCard: {
    borderColor: "#93C5FD",
    backgroundColor: "#F8FBFF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  indicator: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#2563EB",
    marginRight: 9,
    marginTop: 5,
  },
  readIndicator: {
    backgroundColor: "#CBD5E1",
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  categoryLabel: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
  unreadBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 6,
  },
  unreadBadgeText: {
    color: "#1D4ED8",
    fontSize: 10,
    fontWeight: "800",
  },
  message: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 21,
  },
  dateText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 10,
  },
  markReadButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginTop: 6,
  },
  markReadText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    color: "#64748B",
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  loader: {
    marginTop: 30,
  },
});