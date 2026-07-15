import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import { getAnnouncements } from "../../services/announcementService";

export default function TeacherAnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const data = await getAnnouncements();

    setAnnouncements(
      data.filter(
        (item) =>
          item.audience === "All" ||
          item.audience === "Teachers"
      )
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Announcements
      </Text>

      {announcements.length === 0 ? (
        <Text style={styles.empty}>
          No announcements available.
        </Text>
      ) : (
        announcements.map((announcement) => (
          <View
            key={announcement.firestoreId}
            style={styles.card}
          >
            <Text
              style={[
                styles.priority,
                {
                  color:
                    announcement.priority === "Urgent"
                      ? "red"
                      : announcement.priority === "Important"
                      ? "#F59E0B"
                      : "#1565C0",
                },
              ]}
            >
              {announcement.priority}
            </Text>

            <Text style={styles.cardTitle}>
              📢 {announcement.title}
            </Text>

            <Text style={styles.cardMessage}>
              {announcement.message}
            </Text>

            <Text style={styles.audience}>
              Audience: {announcement.audience}
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

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },

  cardMessage: {
    marginTop: 10,
    fontSize: 16,
    color: "#374151",
  },

  priority: {
    fontWeight: "bold",
    fontSize: 15,
  },

  audience: {
    marginTop: 12,
    color: "gray",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "gray",
    fontSize: 16,
  },
});