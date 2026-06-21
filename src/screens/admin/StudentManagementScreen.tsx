import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  Alert,
} from "react-native";

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";

import {
  addStudent,
  getStudents,
} from "../../services/studentService";

export default function StudentManagementScreen() {

  const [studentName, setStudentName] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");

  const [students, setStudents] = useState<any[]>([]);

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

    await addStudent({
      studentName,
      className,
      section,
    });

    setStudentName("");
    setClassName("");
    setSection("");

    loadStudents();
  }

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

      <AppInput
        placeholder="Class"
        value={className}
        onChangeText={setClassName}
      />

      <AppInput
        placeholder="Section"
        value={section}
        onChangeText={setSection}
      />

      <AppButton
        title="Add Student"
        onPress={saveStudent}
      />

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
              {item.studentName}
            </Text>

            <Text>
              Class {item.className}-{item.section}
            </Text>
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

title:{
fontSize:28,
fontWeight:"bold",
marginBottom:20,
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