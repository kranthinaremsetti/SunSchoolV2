import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase/firebaseConfig";
import { getNotifications,Notification } from "../../services/notificationService";



export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      const userSnap = await getDoc(
        doc(db, "users", uid)
      );

      if (!userSnap.exists()) return;

      const user = userSnap.data() as {
        studentId: string;
      };

      const allNotifications = await getNotifications();

      setNotifications(
        allNotifications.filter(
          (item) => item.studentId === user.studentId
        )
      );
    } catch (error) {
      console.log("Notification Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Notifications
      </Text>

      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>
          No notifications available.
        </Text>
      ) : (
        notifications.map((item) => (
          <View
            key={item.firestoreId}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>
              {item.title}
            </Text>

            <Text>{item.message}</Text>
          </View>
        ))
      )}
    </ScrollView>
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

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  emptyText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
    color: "gray",
  },
});