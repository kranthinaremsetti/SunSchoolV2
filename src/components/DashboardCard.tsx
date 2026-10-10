
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { Colors } from "../theme/colors";
import { Fonts } from "../theme/fonts";

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
      disabled={!onPress}
      activeOpacity={0.8}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={title}
    >
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      {count !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.count}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    minHeight: 120,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
  },
  title: {
    color: Colors.secondary,
    fontFamily: Fonts.bold,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  badge: {
    marginTop: 10,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    minWidth: 32,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: "center",
  },
  count: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontWeight: "700",
  },
});
