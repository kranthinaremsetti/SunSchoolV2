import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Picker } from "@react-native-picker/picker";

import { classesData } from "../../constants/classesData";
import { getHomework } from "../../services/homeworkService";

export default function AdminHomeworkScreen() {
  const [selectedClass, setSelectedClass] = useState("5");
  const [homework, setHomework] = useState<any[]>([]);

  useEffect(() => {
    loadHomework();
  }, [selectedClass]);

  const loadHomework = async () => {
    try {
      const data = await getHomework();

      const filtered = data.filter(
        (item: any) => item.className === selectedClass
      );

      setHomework(filtered);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <Text style={styles.title}>Homework</Text>

        <Text style={styles.label}>
          Select Class
        </Text>

        <Picker
          selectedValue={selectedClass}
          onValueChange={(value) =>
            setSelectedClass(value)
          }
        >
          {classesData.map((cls) => (
            <Picker.Item
              key={cls}
              label={cls}
              value={cls}
            />
          ))}
        </Picker>

        {homework.length === 0 ? (
          <Text style={styles.emptyText}>
            No Homework Found
          </Text>
        ) : (
          homework.map((item) => (
            <View
              key={item.firestoreId}
              style={styles.card}
            >
              <Text style={styles.subject}>
                {item.subject}
              </Text>

              <Text style={styles.task}>
                {item.task}
              </Text>

              <Text>
                Due Date : {item.dueDate}
              </Text>

              <Text>
                Class : {item.className}
              </Text>
            </View>
          ))
        )}

        <View style={styles.summaryCard}>
          <Text>
            Total Homework : {homework.length}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },

  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },

  subject: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563EB",
    marginBottom: 8,
  },

  task: {
    fontSize: 16,
    marginBottom: 10,
  },

  summaryCard: {
    backgroundColor: "#E8F5E9",
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    marginTop: 30,
  },
});