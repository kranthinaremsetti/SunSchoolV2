import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Picker,
} from "react-native";

import { getStudents } from "../../services/studentService";
import { saveFee } from "../../services/feeService";

export default function FeeManagementScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");

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
      Number(totalFee),
      Number(paidAmount),
      dueDate
    );

    Alert.alert("Fee Saved");

    setTotalFee("");
    setPaidAmount("");
    setDueDate("");
  };

  return (
    <View style={styles.container}>

      <Text style={styles.heading}>
        Fee Management
      </Text>

      <Picker
        selectedValue={studentId}
        onValueChange={setStudentId}
      >
        {students.map((student) => (
          <Picker.Item
            key={student.id}
            label={`${student.name} (${student.className})`}
            value={student.id}
          />
        ))}
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
  }
});