import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { classesData } from "../../constants/classesData";

import {
  getStudents,
  addStudent,
  deleteStudent,
  updateStudent,
} from "../../services/studentService";

export default function StudentManagementScreen() {

  const [students, setStudents] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [filterClass, setFilterClass] = useState("");

  const [filterSection, setFilterSection] = useState("");

  const [editingStudent, setEditingStudent] =
    useState<any>(null);

  const [studentName, setStudentName] =
    useState("");

  const [rollNo, setRollNo] =
    useState("");

  const [className, setClassName] =
    useState("");

  const [section, setSection] =
    useState("");

  const [showAddModal, setShowAddModal] = useState(false);
const [newStudentName, setNewStudentName] = useState("");
const [newRollNo, setNewRollNo] = useState("");
const [newClassName, setNewClassName] = useState("");
const [newSection, setNewSection] = useState("");

  useFocusEffect(
  React.useCallback(() => {
    loadStudents();
  }, [])
);

  async function loadStudents() {
  try {
    const data = await getStudents();
    setStudents(data);
  } catch (error) {
    console.error("Failed to load students:", error);

    Alert.alert(
      "Error",
      "Unable to load students. Please check your internet connection and try again."
    );
  }
}

  async function removeStudent(id: string) {

    Alert.alert(
      "Delete Student",
      "Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
  try {
    await deleteStudent(id);
    await loadStudents();

    Alert.alert("Success", "Student deleted successfully.");
  } catch (error) {
    console.error("Failed to delete student:", error);

    Alert.alert(
      "Error",
      "Unable to delete student. Please try again."
    );
  }
},
        },
      ]
    );
  }

  function editStudent(item: any) {

    setEditingStudent(item);

    setStudentName(item.name || item.studentName || "");

    setRollNo(item.rollNo);

    setClassName(item.className);

    setSection(item.section);
  }

async function updateCurrentStudent() {
  if (!editingStudent) return;

  if (!studentName.trim() || !rollNo.trim() || !className || !section) {
    Alert.alert("Validation", "Please fill all student details.");
    return;
  }

  try {
    await updateStudent(editingStudent.id, {
      name: studentName.trim(),
      rollNo: rollNo.trim(),
      className,
      section,
    });

    Alert.alert("Success", "Student updated successfully.");

    setEditingStudent(null);
    await loadStudents();
  } catch (error) {
    console.error("Failed to update student:", error);

    Alert.alert(
      "Error",
      "Unable to update student. Please try again."
    );
  }
}

async function handleAddStudent() {
  if (
    !newStudentName.trim() ||
    !newRollNo.trim() ||
    !newClassName ||
    !newSection
  ) {
    Alert.alert("Validation", "Please fill all student details.");
    return;
  }

  try {
    await addStudent({
      name: newStudentName,
      rollNo: newRollNo,
      className: newClassName,
      section: newSection,
    });

    Alert.alert("Success", "Student added successfully.");

    setNewStudentName("");
    setNewRollNo("");
    setNewClassName("");
    setNewSection("");
    setShowAddModal(false);

    await loadStudents();
  } catch (error) {
    console.error("Failed to add student:", error);
    Alert.alert("Error", "Unable to add student. Please try again.");
  }
}

  const filteredStudents =
    students.filter((student) => {

      const classMatch =
        filterClass === "" ||
        student.className === filterClass;

      const sectionMatch =
        filterSection === "" ||
        student.section === filterSection;

      const searchMatch =
  (student.studentName || student.name || "")
    .toLowerCase()
    .includes(search.toLowerCase());

      return (
        classMatch &&
        sectionMatch &&
        searchMatch
      );

    });

  return (

    <SafeAreaView style={styles.container}>

      <FlatList

        data={filteredStudents}

        keyExtractor={(item) => item.id}

        ListHeaderComponent={

          <>

            <Text style={styles.title}>
              Student Management
            </Text>

            <TouchableOpacity
  style={styles.addButton}
  onPress={() => setShowAddModal(true)}
>
  <Text style={styles.buttonText}>＋ Add Student</Text>
</TouchableOpacity>

            <AppInput
              placeholder="Search Student"
              value={search}
              onChangeText={setSearch}
            />

            <Text style={styles.label}>
              Filter Class
            </Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filterClass}
                onValueChange={setFilterClass}
              >
                <Picker.Item
                  label="All Classes"
                  value=""
                />

                {classesData.map((cls) => (
                  <Picker.Item
                    key={cls}
                    label={cls}
                    value={cls}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>
              Filter Section
            </Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filterSection}
                onValueChange={setFilterSection}
              >
                <Picker.Item
                  label="All Sections"
                  value=""
                />

                <Picker.Item
                  label="A"
                  value="A"
                />

                <Picker.Item
                  label="B"
                  value="B"
                />

                <Picker.Item
                  label="C"
                  value="C"
                />

                <Picker.Item
                  label="D"
                  value="D"
                />
              </Picker>
            </View>

          </>

        }

        ListEmptyComponent={
          <Text style={styles.empty}>
            No Students Found
          </Text>
        }

        renderItem={({ item }) => (

          <View style={styles.card}>

            <Text style={styles.name}>
  {item.name || item.studentName || "Unnamed Student"}
</Text>

            <Text>
              Roll No : {item.rollNo}
            </Text>

            <Text>
              Class : {item.className}-{item.section}
            </Text>

            <Text>
              Parent : {item.parentName}
            </Text>

            <Text>
              Mobile : {item.mobile}
            </Text>

            <View style={styles.buttonRow}>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  editStudent(item)
                }
              >
                <Text style={styles.buttonText}>
                  ✏ Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() =>
                  removeStudent(item.id)
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
  visible={showAddModal}
  animationType="slide"
  transparent
  onRequestClose={() => setShowAddModal(false)}
>
  <View style={styles.modalBackground}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>Add Student</Text>

      <AppInput
        placeholder="Student Name"
        value={newStudentName}
        onChangeText={setNewStudentName}
      />

      <AppInput
        placeholder="Roll No"
        value={newRollNo}
        onChangeText={setNewRollNo}
      />

      <Text style={styles.label}>Class</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={newClassName}
          onValueChange={setNewClassName}
        >
          <Picker.Item label="Select Class" value="" />

          {classesData.map((cls) => (
            <Picker.Item
              key={cls}
              label={cls}
              value={cls}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Section</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={newSection}
          onValueChange={setNewSection}
        >
          <Picker.Item label="Select Section" value="" />
          <Picker.Item label="A" value="A" />
          <Picker.Item label="B" value="B" />
          <Picker.Item label="C" value="C" />
          <Picker.Item label="D" value="D" />
        </Picker>
      </View>

      <AppButton
        title="Add Student"
        onPress={handleAddStudent}
      />

      <TouchableOpacity
        onPress={() => setShowAddModal(false)}
      >
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      <Modal
        visible={editingStudent !== null}
        animationType="slide"
        transparent
      >

        <View style={styles.modalBackground}>

          <View style={styles.modalCard}>

            <Text style={styles.modalTitle}>
              Edit Student
            </Text>

            <AppInput
              placeholder="Student Name"
              value={studentName}
              onChangeText={setStudentName}
            />

            <AppInput
              placeholder="Roll No"
              value={rollNo}
              onChangeText={setRollNo}
            />

            <Text style={styles.label}>
              Class
            </Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={className}
                onValueChange={setClassName}
              >
                {classesData.map((cls) => (
                  <Picker.Item
                    key={cls}
                    label={cls}
                    value={cls}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>
              Section
            </Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={section}
                onValueChange={setSection}
              >
                <Picker.Item label="A" value="A" />
                <Picker.Item label="B" value="B" />
                <Picker.Item label="C" value="C" />
                <Picker.Item label="D" value="D" />
              </Picker>
            </View>

            <AppButton
              title="Update Student"
              onPress={updateCurrentStudent}
            />

            <TouchableOpacity
              onPress={() =>
                setEditingStudent(null)
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
    padding: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
  },

  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "gray",
  },

  card: {
    backgroundColor: "white",
    padding: 16,
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

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
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
    elevation: 5,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1565C0",
  },

  cancel: {
    textAlign: "center",
    marginTop: 15,
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
  },
  addButton: {
  backgroundColor: "#16A34A",
  padding: 14,
  borderRadius: 10,
  alignItems: "center",
  marginBottom: 15,
},
});