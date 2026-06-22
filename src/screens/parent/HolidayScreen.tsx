import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import { getHolidays } from "../../services/holidayService";

export default function HolidayScreen() {
  const [holidays, setHolidays] = useState<any[]>([]);

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      const data = await getHolidays();
      setHolidays(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        📅 School Holidays
      </Text>

      {holidays.map((holiday) => (
        <View
          key={holiday.firestoreId}
          style={styles.card}
        >
          <Text style={styles.name}>
            {holiday.title}
          </Text>

          <Text>Date: {holiday.date}</Text>
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
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
});