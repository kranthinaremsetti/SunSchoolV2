import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import { classesData } from "../../constants/classesData";
import { getStudents } from "../../services/studentService";
import { saveFee } from "../../services/feeService";

export default function FeeManagementScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [className, setClassName] = useState("");
  const [academicYear, setAcademicYear] =
    useState("2026-27");
  const [feeType, setFeeType] =
    useState("Tuition Fee");
  const [totalFee, setTotalFee] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const data = await getStudents();
    setStudents(data);

    if (data.length > 0) {
      setStudentId(data[0].id);
    }
  };

  const save = async () => {
    if (
      !studentId ||
      !totalFee ||
      !paidAmount ||
      !dueDate
    ) {
      Alert.alert("Please fill all fields.");
      return;
    }

    await saveFee(
  studentId,
  academicYear,
  feeType,
  Number(totalFee),
  Number(paidAmount),
  dueDate
);

    Alert.alert("Fee Saved");
    setAcademicYear("2026-27");
    setFeeType("Tuition Fee");
    setTotalFee("");
    setPaidAmount("");
    setDueDate("");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>

      <Text style={styles.heading}>
        Fee Management
      </Text>
      <Text style={styles.label}>
  Select Class
</Text>

<Picker
  selectedValue={className}
  onValueChange={(value) => {
    setClassName(value);
    setStudentId("");
  }}
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
  <Text style={styles.label}>
  Select Student
</Text>
      <Picker
        selectedValue={studentId}
        onValueChange={setStudentId}
      >
        {students
  .filter(
    (student) =>
      student.className === className
  )
  .map((student) => (
    <Picker.Item
      key={student.id}
      label={`${student.rollNo} - ${student.name}`}
      value={student.id}
    />
))}
      </Picker>
      <Text style={styles.label}>
  Academic Year
</Text>

<Picker
  selectedValue={academicYear}
  onValueChange={setAcademicYear}
>
  <Picker.Item
    label="2026-27"
    value="2026-27"
  />

  <Picker.Item
    label="2027-28"
    value="2027-28"
  />
</Picker>
      <Text style={styles.label}>
  Fee Type
</Text>

<Picker
  selectedValue={feeType}
  onValueChange={setFeeType}
>
  <Picker.Item
    label="Tuition Fee"
    value="Tuition Fee"
  />

  <Picker.Item
    label="Transport Fee"
    value="Transport Fee"
  />

  <Picker.Item
    label="Examination Fee"
    value="Examination Fee"
  />

  <Picker.Item
    label="Library Fee"
    value="Library Fee"
  />

  <Picker.Item
    label="Miscellaneous"
    value="Miscellaneous"
  />
</Picker>
      <TextInput
        style={styles.input}
        placeholder="Total Fee"
        keyboardType="numeric"
        value={totalFee}
        onChangeText={setTotalFee}
      />

      <TextInput
        style={styles.input}
        placeholder="Paid Amount"
        keyboardType="numeric"
        value={paidAmount}
        onChangeText={setPaidAmount}
      />

      <TextInput
        style={styles.input}
        placeholder="Due Date"
        value={dueDate}
        onChangeText={setDueDate}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={save}
      >
        <Text style={styles.buttonText}>
          Save Fee
        </Text>
      </TouchableOpacity>

    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    padding:20,
    backgroundColor:"#F5F7FA"
  },

  heading:{
    fontSize:28,
    fontWeight:"bold",
    marginBottom:20
  },

  input:{
    backgroundColor:"white",
    borderWidth:1,
    borderColor:"#ddd",
    borderRadius:10,
    padding:12,
    marginVertical:10
  },

  button:{
    backgroundColor:"#1565C0",
    padding:15,
    borderRadius:10,
    marginTop:20,
    alignItems:"center"
  },

  buttonText:{
    color:"white",
    fontWeight:"bold",
    fontSize:16
  },
  label: {
  fontSize: 16,
  fontWeight: "bold",
  marginTop: 10,
  marginBottom: 5,
},
});