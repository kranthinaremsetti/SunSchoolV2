import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState } from "react";
import { saveHomework } from "../../services/homeworkService";
import { auth } from "../../firebase/firebaseConfig";
export default function TeacherHomeworkScreen() {
  const [subject, setSubject] = useState("");
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");

  const postHomework = async () => {
  if (!subject || !task || !dueDate) {
    Alert.alert("Error", "Please fill all fields");
    return;
  }

  try {
    await saveHomework(
      "5th Class", // We'll make this dynamic tomorrow
      subject,
      task,
      dueDate,
      auth.currentUser?.uid || ""
    );

    Alert.alert("Success", "Homework Posted");

    setSubject("");
    setTask("");
    setDueDate("");

  } catch (error) {
    Alert.alert("Error", "Failed to post homework");
    console.log(error);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Post Homework
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Subject"
        value={subject}
        onChangeText={setSubject}
      />

      <TextInput
        style={styles.input}
        placeholder="Homework Task"
        value={task}
        onChangeText={setTask}
      />

      <TextInput
        style={styles.input}
        placeholder="Due Date (YYYY-MM-DD)"
        value={dueDate}
        onChangeText={setDueDate}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={postHomework}
      >
        <Text style={styles.buttonText}>
          Post Homework
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
    borderRadius: 10,
    padding: 15,
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
});