import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";

interface Props {
  title: string;
  count?: number;
  onPress?: () => void;
}

export default function DashboardCard({
  title,
  count,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >
      <Text style={styles.title}>
        {title}
      </Text>

      {count !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.count}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "45%",
    height: 120,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  title: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },

  badge: {
    marginTop: 10,
    backgroundColor: "#1565C0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  count: {
    color: "#fff",
    fontWeight: "bold",
  },
});