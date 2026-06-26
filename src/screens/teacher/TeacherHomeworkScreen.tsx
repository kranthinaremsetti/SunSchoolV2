import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { auth } from "../../firebase/firebaseConfig";
import { saveHomework } from "../../services/homeworkService";

export default function TeacherHomeworkScreen() {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");

  const postHomework = async () => {
    if (!className || !subject || !task || !dueDate) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      await saveHomework(
        className,
        subject,
        task,
        dueDate,
        auth.currentUser?.uid || ""
      );

      Alert.alert("Success", "Homework Posted Successfully");

      setClassName("");
      setSubject("");
      setTask("");
      setDueDate("");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to post homework");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post Homework</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={className}
          onValueChange={setClassName}
        >
          <Picker.Item label="Select Class" value="" />
          <Picker.Item label="Class 1" value="1" />
          <Picker.Item label="Class 2" value="2" />
          <Picker.Item label="Class 3" value="3" />
          <Picker.Item label="Class 4" value="4" />
          <Picker.Item label="Class 5" value="5" />
          <Picker.Item label="Class 6" value="6" />
          <Picker.Item label="Class 7" value="7" />
          <Picker.Item label="Class 8" value="8" />
          <Picker.Item label="Class 9" value="9" />
          <Picker.Item label="Class 10" value="10" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Subject"
        value={subject}
        onChangeText={setSubject}
      />

      <TextInput
        style={[styles.input, { height: 120 }]}
        placeholder="Homework Details"
        value={task}
        onChangeText={setTask}
        multiline
        textAlignVertical="top"
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

const PRIMARY = "#1565C0";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: PRIMARY,
    marginBottom: 25,
  },

  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },

  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    fontSize: 16,
  },

  button: {
    backgroundColor: PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});