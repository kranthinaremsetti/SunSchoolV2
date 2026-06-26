import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { auth } from "../../firebase/firebaseConfig";
import { saveResult } from "../../services/resultService";
import { Picker } from "@react-native-picker/picker";
import { useState, useEffect } from "react";
import { getStudents } from "../../services/studentService";
export default function TeacherResultsScreen() {
  const [students, setStudents] =
  useState<any[]>([]);
  useEffect(() => {
  loadStudents();
}, []);
const [className, setClassName] = useState("");
const loadStudents = async () => {
  const data =
    await getStudents();

  setStudents(data);
};
  const [studentId, setStudentId] =
  useState("1");

  const [subject, setSubject] =
    useState("Mathematics");
  const [marks, setMarks] =
    useState("");
  const [examType, setExamType] = useState("Unit Test 1");
const [maxMarks, setMaxMarks] = useState("100");
const [remarks, setRemarks] = useState("");

  const submitResult = async () => {
    if (
  !studentId ||
  !subject ||
  !examType ||
  !marks ||
  !maxMarks ||
  !remarks
) {
    Alert.alert("Error", "Fill all fields");
    return;
  }

  try {
    if (Number(marks) > Number(maxMarks)) {
  Alert.alert(
    "Invalid Marks",
    "Marks cannot exceed maximum marks."
  );
  return;
}
    await saveResult(
  studentId,
  subject,
  examType,
  Number(marks),
  Number(maxMarks),
  remarks,
  auth.currentUser?.uid || ""
);

    Alert.alert("Success", "Marks Added");

    setStudentId("");
    setSubject("Mathematics");
    setMarks("");
    setExamType("Unit Test 1");
    setMaxMarks("100");
    setRemarks("");
  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Failed to save result");
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Enter Marks
      </Text>

    <Text style={styles.label}>Select Class</Text>

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

      <Text style={styles.label}>
        Select Student
      </Text>

      <Picker
        selectedValue={studentId}
        onValueChange={(itemValue) =>
          setStudentId(itemValue)
        }
      >
        {students
  .filter(student => student.className === className)
  .map(student => (
    <Picker.Item
      key={student.id}
      label={`${student.rollNo} - ${student.name}`}
      value={student.id}
    />
))}
      </Picker>

      <Text style={styles.label}>
        Select Subject
      </Text>

      <Picker
        selectedValue={subject}
        onValueChange={(itemValue) =>
          setSubject(itemValue)
        }
      >
        <Picker.Item
          label="Mathematics"
          value="Mathematics"
        />
        <Picker.Item
          label="Science"
          value="Science"
        />
        <Picker.Item
          label="English"
          value="English"
        />
        <Picker.Item
          label="Social"
          value="Social"
        />
        <Picker.Item
          label="Computer"
          value="Computer"
        />
      </Picker>
        <Text style={styles.label}>
  Exam Type
</Text>

<Picker
  selectedValue={examType}
  onValueChange={(value) => setExamType(value)}
>
  <Picker.Item label="Unit Test 1" value="Unit Test 1" />
  <Picker.Item label="Unit Test 2" value="Unit Test 2" />
  <Picker.Item label="Mid Term" value="Mid Term" />
  <Picker.Item label="Final Exam" value="Final Exam" />
</Picker>
      <TextInput
        style={styles.input}
        placeholder="Marks"
        value={marks}
        onChangeText={setMarks}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Maximum Marks"
        value={maxMarks}
        onChangeText={setMaxMarks}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Remarks"
        value={remarks}
        onChangeText={setRemarks}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={submitResult}
      >
        <Text style={styles.buttonText}>
          Save Marks
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
    padding: 15,
    borderRadius: 10,
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
  label: {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 5,
},
});