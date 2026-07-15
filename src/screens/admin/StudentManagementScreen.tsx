import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { Picker } from "@react-native-picker/picker";
import { classesData } from "../../constants/classesData";
import {
  addStudent,
  getStudents,
  deleteStudent,
  updateStudent,
} from "../../services/studentService";

export default function StudentManagementScreen() {

  const [studentName, setStudentName] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [filterClass, setFilterClass] = useState("");
const [filterSection, setFilterSection] = useState("");
  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    const data = await getStudents();
    setStudents(data);
  }

  async function saveStudent() {

  if (!studentName || !className) {
    Alert.alert("Enter all fields");
    return;
  }

  if (editingId) {
  await updateStudent(editingId, {
    studentName,
    className,
    section,
  });

  Alert.alert("Success", "Student Updated");
  setEditingId(null);
} else {
  await addStudent({
    studentName,
    className,
    section,
  });

  Alert.alert("Success", "Student Added");
}

  setStudentName("");
  setClassName("");
  setSection("");

  loadStudents();
}
function editStudent(item: any) {

  setEditingId(item.id);

  setStudentName(item.studentName);

  setClassName(item.className);

  setSection(item.section);
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

          await deleteStudent(id);

          loadStudents();

        },
      },
    ]
  );
} 

const filteredStudents = students.filter((student) => {
  const classMatch =
    filterClass === "" ||
    student.className === filterClass;

  const sectionMatch =
    filterSection === "" ||
    student.section === filterSection;

  return classMatch && sectionMatch;
});

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>
        Student Management
      </Text>

      <AppInput
        placeholder="Student Name"
        value={studentName}
        onChangeText={setStudentName}
      />

      <Text style={styles.label}>
  Select Class
</Text>

<View style={styles.pickerContainer}>
  <Picker
    selectedValue={className}
    onValueChange={(value) => setClassName(value)}
  >
    <Picker.Item
      label="Select Class"
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
  Select Section
</Text>

<View style={styles.pickerContainer}>
  <Picker
    selectedValue={section}
    onValueChange={(value) => setSection(value)}
  >
    <Picker.Item label="Select Section" value="" />
    <Picker.Item label="A" value="A" />
    <Picker.Item label="B" value="B" />
    <Picker.Item label="C" value="C" />
    <Picker.Item label="D" value="D" />
  </Picker>
</View>

      <AppButton
        title={
  editingId
    ? "Update Student"
    : "Add Student"
}
        onPress={saveStudent}
      />
      <Text style={styles.filterTitle}>
  Filter Students
</Text>

<Text style={styles.label}>
  Class
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
  Section
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

    <Picker.Item label="A" value="A" />
    <Picker.Item label="B" value="B" />
    <Picker.Item label="C" value="C" />
    <Picker.Item label="D" value="D" />
  </Picker>
</View>
      <FlatList
  data={filteredStudents}
  ListEmptyComponent={
    <Text style={styles.empty}>
      No students found.
    </Text>
  }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>

  <Text style={styles.name}>
    {item.studentName}
  </Text>

  <Text>
    Class: {item.className}
  </Text>

  <Text>
    Section: {item.section}
  </Text>

  <View style={styles.buttonRow}>
  <TouchableOpacity
    style={styles.editButton}
    onPress={() => editStudent(item)}
  >
    <Text style={styles.buttonText}>
      ✏ Edit
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.deleteButton}
    onPress={() => removeStudent(item.id)}
  >
    <Text style={styles.buttonText}>
      🗑 Delete
    </Text>
  </TouchableOpacity>
</View>

</View>
        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

container:{
flex:1,
padding:15,
backgroundColor:"#F5F7FA"
},
buttonRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 12,
},
title:{
fontSize:28,
fontWeight:"bold",
marginBottom:20,
},
label: {
  fontSize: 16,
  fontWeight: "bold",
  marginTop: 10,
  marginBottom: 5,
},

pickerContainer: {
  backgroundColor: "white",
  borderRadius: 10,
  marginBottom: 15,
  elevation: 2,
},

editButton: {
  backgroundColor: "#2563EB",
  padding: 10,
  borderRadius: 8,
  width: "48%",
  alignItems: "center",
},

deleteButton: {
  backgroundColor: "#DC2626",
  padding: 10,
  borderRadius: 8,
  width: "48%",
  alignItems: "center",
},
filterTitle: {
  fontSize: 20,
  fontWeight: "bold",
  marginTop: 20,
  marginBottom: 10,
},

empty: {
  textAlign: "center",
  marginTop: 30,
  color: "gray",
  fontSize: 16,
},
buttonText: {
  color: "white",
  fontWeight: "bold",
},
card:{
backgroundColor:"white",
padding:15,
borderRadius:10,
marginTop:10,
elevation:2,
},

name:{
fontSize:18,
fontWeight:"bold",
},

});