import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

export default function TeacherManagementScreen() {
  const [teachers, setTeachers] =
    useState<any[]>([]);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    const snapshot = await getDocs(
      collection(db, "teachers")
    );

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTeachers(data);
  };

  const deleteTeacher = async (
    id: string
  ) => {
    Alert.alert(
      "Delete Teacher",
      "Are you sure?",
      [
        {
          text: "Cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteDoc(
              doc(db, "teachers", id)
            );

            loadTeachers();
          },
        },
      ]
    );
  };

  return (
    <FlatList
      data={teachers}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        padding: 15,
      }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>
            {item.teacherName}
          </Text>

          <Text>
            Subject: {item.subject}
          </Text>

          <Text>
            Qualification:
            {" "}
            {item.qualification}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              deleteTeacher(item.id)
            }
          >
            <Text
              style={styles.buttonText}
            >
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  button: {
    marginTop: 15,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});