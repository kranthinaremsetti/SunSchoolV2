import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { auth } from "../../firebase/firebaseConfig";
import { saveResult } from "../../services/resultService";
import { Picker } from "@react-native-picker/picker";
import { useState, useEffect } from "react";
import { getStudents } from "../../services/studentService";
export default function TeacherResultsScreen() {
  const [students, setStudents] =
  useState<any[]>([]);
  useEffect(() => {
  loadStudents();
}, []);

const loadStudents = async () => {
  const data =
    await getStudents();

  setStudents(data);
};
  const [studentId, setStudentId] =
  useState("1");

  const [subject, setSubject] =
    useState("Mathematics");
  const [marks, setMarks] =
    useState("");

  const submitResult = async () => {
  if (!studentId || !subject || !marks) {
    Alert.alert("Error", "Fill all fields");
    return;
  }

  try {
    await saveResult(
      studentId,
      subject,
      Number(marks),
      auth.currentUser?.uid || ""
    );

    Alert.alert("Success", "Marks Added");

    setStudentId("");
    setSubject("Mathematics");
    setMarks("");

  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Failed to save result");
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Enter Marks
      </Text>

      <Text style={styles.label}>
        Select Student
      </Text>

      <Picker
        selectedValue={studentId}
        onValueChange={(itemValue) =>
          setStudentId(itemValue)
        }
      >
        {students.map((student) => (
          <Picker.Item
            key={student.id}
            label={student.name}
            value={student.id.toString()}
          />
        ))}
      </Picker>

      <Text style={styles.label}>
        Select Subject
      </Text>

      <Picker
        selectedValue={subject}
        onValueChange={(itemValue) =>
          setSubject(itemValue)
        }
      >
        <Picker.Item
          label="Mathematics"
          value="Mathematics"
        />
        <Picker.Item
          label="Science"
          value="Science"
        />
        <Picker.Item
          label="English"
          value="English"
        />
        <Picker.Item
          label="Social"
          value="Social"
        />
        <Picker.Item
          label="Computer"
          value="Computer"
        />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Marks"
        value={marks}
        onChangeText={setMarks}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={submitResult}
      >
        <Text style={styles.buttonText}>
          Save Marks
        </Text>
      </TouchableOpacity>
    </View>
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

  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  label: {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 5,
},
});