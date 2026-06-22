import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import {
  getAnnouncements,
} from "../services/announcementService";

export default function AnnouncementsScreen() {
  const [
    announcements,
    setAnnouncements,
  ] = useState<any[]>([]);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements =
    async () => {
      const data =
        await getAnnouncements();

      setAnnouncements(
        data
      );
    };
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Announcements
      </Text>

      {announcements.map((announcement) => (
        <View
          key={announcement.firestoreId}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>
            📢 {announcement.title}
          </Text>

          <Text style={styles.cardMessage}>
            {announcement.message}
          </Text>
        </View>
      ))}
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
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },

  cardMessage: {
    fontSize: 16,
    color: "#374151",
  },
});