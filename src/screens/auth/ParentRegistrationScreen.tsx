import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !fatherName.trim() ||
      !mobile.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !studentName.trim() ||
      !rollNo.trim() ||
      !studentClass.trim()
    ) {
      Alert.alert(
        "Missing Details",
        "Please complete all required fields."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "The passwords do not match.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      await registerParent({
        fatherName,
        motherName,
        mobile,
        email: email.trim(),
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
        "Registration submitted. Wait for Admin Approval."
      );

      setFatherName("");
      setMotherName("");
      setMobile("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setStudentName("");
      setRollNo("");
      setStudentClass("");
      setSection("");
      setDob("");
      setAadhaar("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error?.message || "Unable to register. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
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

          {/* Password field with visibility toggle */}
          <View style={styles.passwordRow}>
            <View style={styles.passwordInputWrapper}>
              <AppInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((previous) => !previous)}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
            >
              <Text style={styles.eyeIcon}>
                {showPassword ? "🙈" : "👁️"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Confirm password field with visibility toggle */}
          <View style={styles.passwordRow}>
            <View style={styles.passwordInputWrapper}>
              <AppInput
                placeholder="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() =>
                setShowConfirmPassword((previous) => !previous)
              }
              accessibilityRole="button"
              accessibilityLabel={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              <Text style={styles.eyeIcon}>
                {showConfirmPassword ? "🙈" : "👁️"}
              </Text>
            </TouchableOpacity>
          </View>

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
            title={loading ? "Registering..." : "Register"}
            onPress={handleRegister}
          />

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PRIMARY = "#1565C0";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 50,
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
    backgroundColor: "#DDD",
    marginVertical: 25,
  },

  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  passwordInputWrapper: {
    flex: 1,
  },

  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },

  eyeIcon: {
    fontSize: 21,
  },

  bottomSpace: {
    height: 25,
  },
});