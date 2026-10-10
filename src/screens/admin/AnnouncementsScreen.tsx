import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useEffect, useState } from "react";

import { getAnnouncements } from "../../services/announcementService";

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    const data = await getAnnouncements();
    setAnnouncements(data);
  }, []);

  useEffect(() => {
    loadAnnouncements().catch((error) => {
      console.error("Failed to load announcements:", error);
      Alert.alert("Error", "Unable to load announcements.");
    });
  }, [loadAnnouncements]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAnnouncements();
    } catch (error) {
      console.error("Failed to refresh announcements:", error);
      Alert.alert("Error", "Unable to refresh announcements.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
      >
        <Text style={styles.title}>Announcements</Text>

        {announcements.length === 0 ? (
          <Text style={styles.empty}>No announcements available.</Text>
        ) : (
          announcements.map((announcement) => (
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
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingBottom: 30,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 8,
  },
  cardMessage: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  empty: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 30,
    fontSize: 16,
  },
});