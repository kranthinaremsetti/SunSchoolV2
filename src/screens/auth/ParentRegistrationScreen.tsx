import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { registerParent } from "../../services/authService";
export default function ParentRegistrationScreen() {
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [section, setSection] = useState("");
  const [dob, setDob] = useState("");
  const [aadhaar, setAadhaar] = useState("");

  const handleRegister = async () => {
  try {
    await registerParent({
      fatherName,
      motherName,
      mobile,
      email,
      password,
      studentName,
      rollNo,
      studentClass,
      section,
      dob,
      aadhaar,
    });

    Alert.alert(
      "Success",
      "Registration Submitted.\nWait for Admin Approval."
    );

  } catch (error: any) {
    Alert.alert(
      "Registration Failed",
      error.message
    );
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.title}>Parent Registration</Text>

        <Text style={styles.heading}>Parent Details</Text>

        <AppInput
          placeholder="Father Name"
          value={fatherName}
          onChangeText={setFatherName}
        />

        <AppInput
          placeholder="Mother Name"
          value={motherName}
          onChangeText={setMotherName}
        />

        <AppInput
          placeholder="Mobile Number"
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={setMobile}
        />

        <AppInput
          placeholder="Email Address"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <AppInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <AppInput
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <View style={styles.divider} />

        <Text style={styles.heading}>Student Details</Text>

        <AppInput
          placeholder="Student Name"
          value={studentName}
          onChangeText={setStudentName}
        />

        <AppInput
          placeholder="Roll Number"
          value={rollNo}
          onChangeText={setRollNo}
        />

        <AppInput
          placeholder="Class"
          value={studentClass}
          onChangeText={setStudentClass}
        />

        <AppInput
          placeholder="Section"
          value={section}
          onChangeText={setSection}
        />

        <AppInput
          placeholder="Date of Birth"
          value={dob}
          onChangeText={setDob}
        />

        <AppInput
          placeholder="Aadhaar Number (Optional)"
          keyboardType="numeric"
          value={aadhaar}
          onChangeText={setAadhaar}
        />

        <AppButton
          title="Register"
          onPress={handleRegister}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = "#1565C0";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: PRIMARY,
    textAlign: "center",
    marginBottom: 25,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    color: "#333",
  },

  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 25,
  },
});