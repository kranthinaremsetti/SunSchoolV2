import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

export default function HolidayManagementScreen() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [holidays, setHolidays] = useState<any[]>([]);

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    const snapshot = await getDocs(
      collection(db, "holidays")
    );

    setHolidays(
      snapshot.docs.map((d) => ({
        firestoreId: d.id,
        ...d.data(),
      }))
    );
  };

  const addHoliday = async () => {
    if (!title || !date) {
      Alert.alert(
        "Error",
        "Please fill all fields."
      );
      return;
    }

    await addDoc(
      collection(db, "holidays"),
      {
        title,
        date,
      }
    );

    setTitle("");
    setDate("");

    loadHolidays();

    Alert.alert(
      "Success",
      "Holiday Added"
    );
  };

  const removeHoliday = async (
    id: string
  ) => {
    await deleteDoc(
      doc(db, "holidays", id)
    );

    loadHolidays();
  };

  return (
    <View style={styles.container}>

      <Text style={styles.heading}>
        Holiday Management
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Holiday Name"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Date"
        value={date}
        onChangeText={setDate}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={addHoliday}
      >
        <Text style={styles.buttonText}>
          Add Holiday
        </Text>
      </TouchableOpacity>

      <FlatList
        data={holidays}
        keyExtractor={(item) =>
          item.firestoreId
        }
        renderItem={({ item }) => (
          <View style={styles.card}>

            <Text style={styles.name}>
              {item.title}
            </Text>

            <Text>{item.date}</Text>

            <TouchableOpacity
              style={styles.delete}
              onPress={() =>
                removeHoliday(
                  item.firestoreId
                )
              }
            >
              <Text
                style={styles.deleteText}
              >
                Delete
              </Text>
            </TouchableOpacity>

          </View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    padding:15,
    backgroundColor:"#F5F7FA"
  },

  heading:{
    fontSize:26,
    fontWeight:"bold",
    marginBottom:20
  },

  input:{
    backgroundColor:"white",
    borderWidth:1,
    borderColor:"#ddd",
    borderRadius:10,
    padding:12,
    marginBottom:10
  },

  button:{
    backgroundColor:"#1565C0",
    padding:15,
    borderRadius:10,
    alignItems:"center",
    marginBottom:20
  },

  buttonText:{
    color:"white",
    fontWeight:"bold"
  },

  card:{
    backgroundColor:"white",
    padding:15,
    borderRadius:10,
    marginBottom:10
  },

  name:{
    fontSize:18,
    fontWeight:"bold"
  },

  delete:{
    marginTop:10,
    backgroundColor:"red",
    padding:10,
    borderRadius:8,
    alignItems:"center"
  },

  deleteText:{
    color:"white",
    fontWeight:"bold"
  }
});