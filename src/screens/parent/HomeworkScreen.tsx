import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase/firebaseConfig";

import {
  getHomework,
  Homework,
} from "../../services/homeworkService";


export default function HomeworkScreen() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadHomework();
  }, []);

  const loadHomework = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      // Get logged-in user
      const userSnap = await getDoc(
        doc(db, "users", uid)
      );

      if (!userSnap.exists()) return;

      const user = userSnap.data() as {
        studentId: string;
      };

      // Get student document
      const studentSnap = await getDoc(
        doc(db, "students", user.studentId)
      );

      if (!studentSnap.exists()) return;

      const student = studentSnap.data() as {
        className: string;
      };

      // Load homework
      const allHomework = await getHomework();

      const filtered = allHomework
  .filter(
    (item) =>
      item.className === student.className
  )
  .sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate)
  );

setHomework(filtered);
    } catch (error) {
      console.log("Homework Error:", error);
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
        Homework
      </Text>

      {homework.length === 0 ? (
        <Text
          style={{
            textAlign: "center",
            color: "gray",
            marginTop: 20,
          }}
        >
          No homework available.
        </Text>
      ) : (
        homework.map((item) => (
          <View
  key={item.firestoreId}
  style={styles.card}
>
  <Text style={styles.subject}>
    📘 {item.subject}
  </Text>

  <Text
    style={{
      marginTop: 8,
      fontSize: 15,
      color: "#333",
      lineHeight: 22,
    }}
  >
    {item.task}
  </Text>

  <View
    style={{
      marginTop: 15,
      borderTopWidth: 1,
      borderColor: "#EEE",
      paddingTop: 10,
    }}
  >
    <Text style={styles.date}>
      📅 Due Date: {item.dueDate}
    </Text>
  </View>
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
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },

  subject: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  date: {
    marginTop: 10,
    color: "gray",
  },
});