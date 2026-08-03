import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import AppInput from "../../components/AppInput";
import {
  Modal,
} from "react-native";

import AppButton from "../../components/AppButton";
import {
  getTeachers,
  deleteTeacher,
  updateTeacher,
} from "../../services/teacherService";
export default function TeacherManagementScreen() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editingTeacher, setEditingTeacher] = useState<any>(null);

const [teacherName, setTeacherName] = useState("");

const [subject, setSubject] = useState("");

const [qualification, setQualification] = useState("");

const [experience, setExperience] = useState("");
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (error) {
      console.log(error);
    }
  };
  function editTeacher(item: any) {
  setEditingTeacher(item);

  setTeacherName(item.teacherName);

  setSubject(item.subject);

  setQualification(item.qualification);

  setExperience(item.experience);
}

async function updateCurrentTeacher() {
  if (!editingTeacher) return;

  await updateTeacher(
    editingTeacher.id,
    {
      teacherName,
      subject,
      qualification,
      experience,
    }
  );

  Alert.alert(
    "Success",
    "Teacher Updated"
  );

  setEditingTeacher(null);

  loadTeachers();
}
  const handleDeleteTeacher = (id: string) => {
    Alert.alert(
      "Delete Teacher",
      "Are you sure you want to delete this teacher?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteTeacher(id);
            loadTeachers();
          },
        },
      ]
    );
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const teacherName =
      teacher.teacherName?.toLowerCase() || "";

    const subject =
      teacher.subject?.toLowerCase() || "";

    const keyword = search.toLowerCase();

    return (
      teacherName.includes(keyword) ||
      subject.includes(keyword)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredTeachers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 15,
          paddingBottom: 30,
        }}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>
              Teacher Management
            </Text>

            <AppInput
              placeholder="Search Teacher"
              value={search}
              onChangeText={setSearch}
            />
          </>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No Teachers Found
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
              {item.teacherName}
            </Text>

            <Text>
              📚 Subject: {item.subject}
            </Text>

            <Text>
              🎓 Qualification:{" "}
              {item.qualification}
            </Text>

            <Text>
              💼 Experience: {item.experience} Years
            </Text>

            <Text>
              📧 Email: {item.email}
            </Text>

            <Text>
              📱 Mobile: {item.mobile}
            </Text>

            <View style={styles.buttonRow}>

  <TouchableOpacity
    style={styles.editButton}
    onPress={() =>
      editTeacher(item)
    }
  >
    <Text style={styles.buttonText}>
      ✏ Edit
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.deleteButton}
    onPress={() =>
      handleDeleteTeacher(item.id)
    }
  >
    <Text style={styles.buttonText}>
      🗑 Delete
    </Text>
  </TouchableOpacity>

</View>
          </View>
        )}
      />
      <Modal
  visible={editingTeacher !== null}
  animationType="slide"
  transparent
>
  <View style={styles.modalBackground}>
    <View style={styles.modalCard}>

      <Text style={styles.modalTitle}>
        Edit Teacher
      </Text>

      <AppInput
        placeholder="Teacher Name"
        value={teacherName}
        onChangeText={setTeacherName}
      />

      <AppInput
        placeholder="Subject"
        value={subject}
        onChangeText={setSubject}
      />

      <AppInput
        placeholder="Qualification"
        value={qualification}
        onChangeText={setQualification}
      />

      <AppInput
        placeholder="Experience"
        value={experience}
        onChangeText={setExperience}
      />

      <AppButton
        title="Update Teacher"
        onPress={updateCurrentTeacher}
      />

      <TouchableOpacity
        onPress={() =>
          setEditingTeacher(null)
        }
      >
        <Text style={styles.cancel}>
          Cancel
        </Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
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

  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1565C0",
  },

  button: {
    marginTop: 15,
    backgroundColor: "#DC2626",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "gray",
    fontSize: 16,
  },
  buttonRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 15,
},

editButton: {
  backgroundColor: "#2563EB",
  width: "48%",
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
},

deleteButton: {
  backgroundColor: "#DC2626",
  width: "48%",
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
},

modalBackground: {
  flex: 1,
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
  padding: 20,
},

modalCard: {
  backgroundColor: "white",
  borderRadius: 15,
  padding: 20,
},

modalTitle: {
  fontSize: 24,
  fontWeight: "bold",
  marginBottom: 20,
  textAlign: "center",
},

cancel: {
  color: "red",
  textAlign: "center",
  marginTop: 15,
  fontWeight: "bold",
},
});