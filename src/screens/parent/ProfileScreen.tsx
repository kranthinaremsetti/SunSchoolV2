import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase/firebaseConfig";

interface Student {
  name: string;
  className: string;
  rollNo: string;
  parentId: string;
  section?: string;
}

export default function ProfileScreen() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      // Logged-in user
      const userSnap = await getDoc(doc(db, "users", uid));

      if (!userSnap.exists()) return;

      const user = userSnap.data() as {
        studentId: string;
      };

      // Linked student
      const studentSnap = await getDoc(
        doc(db, "students", user.studentId)
      );

      if (!studentSnap.exists()) return;

      setStudent(studentSnap.data() as Student);

    } catch (error) {
      console.log("Profile Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Student not found
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Student Profile
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{student.name}</Text>

        <Text style={styles.label}>Class</Text>
        <Text style={styles.value}>{student.className}</Text>

        <Text style={styles.label}>Section</Text>
        <Text style={styles.value}>
          {student.section || "-"}
        </Text>

        <Text style={styles.label}>Roll Number</Text>
        <Text style={styles.value}>{student.rollNo}</Text>

        <Text style={styles.label}>Parent ID</Text>
        <Text style={styles.value}>{student.parentId}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    color: "#2563EB",
  },

  value: {
    fontSize: 18,
    marginTop: 4,
    color: "#374151",
  },

  errorText: {
    fontSize: 20,
    color: "red",
    textAlign: "center",
  },
});