import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import { getStudents } from "../../services/studentService";
import { Picker } from "@react-native-picker/picker";
import { classesData } from "../../constants/classesData";
export default function TeacherStudentsScreen() {
  const [students, setStudents] =
    useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadStudents();
  }, []);
  const filteredStudents = students.filter(
  (student) =>
    selectedClass === "" ||
    student.className === selectedClass
);
const loadStudents = async () => {
  try {
    const data =
      await getStudents();

    console.log(
      "Teacher Students:",
      data
    );

    setStudents(data);
  } catch (error) {
    console.log(
      "Student Load Error:",
      error
    );
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Students
      </Text>
      <Text style={styles.label}>
        Select Class
      </Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedClass}
          onValueChange={setSelectedClass}
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
      {filteredStudents.length === 0 ? (
  <Text style={styles.empty}>
    No students found.
  </Text>
) : (
  filteredStudents.map((student) => (
    <View
      key={student.id}
      style={styles.card}
    >
      <Text style={styles.name}>
        {student.name}
      </Text>

      <Text>
        Class: {student.className}
      </Text>

      <Text>
        Roll No: {student.rollNo}
      </Text>
    </View>
  ))
)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  empty: {
  textAlign: "center",
  color: "gray",
  marginTop: 30,
  fontSize: 16,
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
    marginBottom: 8,
  },
  label: {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 5,
},

pickerContainer: {
  backgroundColor: "white",
  borderRadius: 10,
  marginBottom: 20,
  elevation: 2,
},
});