import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
} from "react-native";

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";

export default function TeacherRegistrationScreen() {
  const [teacherName, setTeacherName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [qualification, setQualification] = useState("");
  const [subject, setSubject] = useState("");
  const [experience, setExperience] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    if (
      !teacherName ||
      !mobile ||
      !email ||
      !qualification ||
      !subject ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    Alert.alert(
      "Success",
      "Teacher Registration UI Completed.\nFirebase will be connected next."
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.title}>
          Teacher Registration
        </Text>

        <AppInput
          placeholder="Teacher Name"
          value={teacherName}
          onChangeText={setTeacherName}
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
          placeholder="Qualification"
          value={qualification}
          onChangeText={setQualification}
        />

        <AppInput
          placeholder="Subject"
          value={subject}
          onChangeText={setSubject}
        />

        <AppInput
          placeholder="Experience (Years)"
          keyboardType="numeric"
          value={experience}
          onChangeText={setExperience}
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
    marginBottom: 30,
  },
});