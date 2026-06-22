import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase/firebaseConfig";
import { getTimetable } from "../../services/timetableService";

interface Timetable {
  firestoreId: string;
  className: string;
  day: string;
  subjects: string[];
}

export default function TimetableScreen() {
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
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

      const studentSnap = await getDoc(
        doc(db, "students", user.studentId)
      );

      if (!studentSnap.exists()) return;

      const student = studentSnap.data() as {
        className: string;
      };

      const allTimetable = await getTimetable();

      setTimetable(
        allTimetable.filter(
          (item) =>
            item.className === student.className
        )
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Timetable
      </Text>

      {timetable.length === 0 ? (
        <Text style={styles.empty}>
          No timetable available.
        </Text>
      ) : (
        timetable.map((item) => (
          <View
            key={item.firestoreId}
            style={styles.card}
          >
            <Text style={styles.day}>
              {item.day}
            </Text>

            {item.subjects.map((subject, index) => (
              <Text
                key={index}
                style={styles.subject}
              >
                • {subject}
              </Text>
            ))}
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

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

  day: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subject: {
    fontSize: 16,
    marginBottom: 5,
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "gray",
    fontSize: 16,
  },
});