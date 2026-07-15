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
  getAnnouncements,
  saveAnnouncement,
} from "../../services/announcementService";
import { Picker } from "@react-native-picker/picker";
export default function AdminAnnouncementsScreen() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] =useState("All");
  const [priority, setPriority] = useState("General");
  const [announcements, setAnnouncements] =
    useState<any[]>([]);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const data = await getAnnouncements();
    setAnnouncements(data);
  };

  const addAnnouncement = async () => {
    if (!title || !message) {
      Alert.alert(
        "Error",
        "Please fill all fields."
      );
      return;
    }

    await saveAnnouncement(
  title,
  message,
  audience,
  priority
);

    setTitle("");
    setMessage("");

    loadAnnouncements();

    Alert.alert(
      "Success",
      "Announcement Added"
    );
  };

  return (
    <View style={styles.container}>

      <Text style={styles.heading}>
        Announcements
      </Text>

      <TextInput
        placeholder="Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Message"
        style={[
          styles.input,
          { height: 90 }
        ]}
        multiline
        value={message}
        onChangeText={setMessage}
      />
      <Text style={styles.label}>
        Audience
      </Text>

      <Picker
        selectedValue={audience}
        onValueChange={setAudience}
      >
        <Picker.Item label="All" value="All" />
        <Picker.Item label="Parents" value="Parents" />
        <Picker.Item label="Teachers" value="Teachers" />
      </Picker>
      <Text style={styles.label}>
  Priority
</Text>

<Picker
  selectedValue={priority}
  onValueChange={setPriority}
>
  <Picker.Item
    label="General"
    value="General"
  />

  <Picker.Item
    label="Important"
    value="Important"
  />

  <Picker.Item
    label="Urgent"
    value="Urgent"
  />
</Picker>
      <TouchableOpacity
        style={styles.button}
        onPress={addAnnouncement}
      >
        <Text style={styles.buttonText}>
          Add Announcement
        </Text>
      </TouchableOpacity>

      <FlatList
        data={announcements}
        keyExtractor={(item) => item.firestoreId}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {item.title}
            </Text>

            <Text>{item.message}</Text>
          </View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F5F7FA",
  },

  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  button: {
    backgroundColor: "#1565C0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },

  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 6,
  },
  label: {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 5,
  marginTop: 10,
},
});