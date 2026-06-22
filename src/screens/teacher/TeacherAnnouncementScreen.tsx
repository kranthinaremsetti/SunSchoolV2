import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import { useState } from "react";
import {
  saveAnnouncement,
} from "../../services/announcementService";

export default function TeacherAnnouncementScreen() {
  const [title, setTitle] = useState("");
  const [message, setMessage] =
    useState("");

  const postAnnouncement = async() => {
    if (!title || !message) {
      Alert.alert(
        "Error",
        "Please fill all fields"
      );
      return;
    }

    await saveAnnouncement(
  title,
  message
);

    Alert.alert(
      "Success",
      "Announcement Posted"
    );

    setTitle("");
    setMessage("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Post Announcement
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Message"
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={postAnnouncement}
      >
        <Text style={styles.buttonText}>
          Post Announcement
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