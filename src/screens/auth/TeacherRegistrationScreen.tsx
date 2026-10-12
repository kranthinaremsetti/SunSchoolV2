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
import { registerTeacher } from "../../services/authService";

export default function TeacherRegistrationScreen() {
  const [teacherName, setTeacherName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [qualification, setQualification] = useState("");
  const [subject, setSubject] = useState("");
  const [experience, setExperience] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !teacherName.trim() ||
      !mobile.trim() ||
      !email.trim() ||
      !qualification.trim() ||
      !subject.trim() ||
      !experience.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Missing Details",
        "Please complete all required fields."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "The passwords do not match."
      );
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      await registerTeacher({
        teacherName,
        mobile,
        email: email.trim(),
        qualification,
        subject,
        experience,
        password,
      });

      Alert.alert(
        "Success",
        "Registration submitted. Wait for Admin Approval."
      );

      setTeacherName("");
      setMobile("");
      setEmail("");
      setQualification("");
      setSubject("");
      setExperience("");
      setPassword("");
      setConfirmPassword("");
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
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        >
          <Text style={styles.title}>Teacher Registration</Text>

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
              onPress={() =>
                setShowPassword((previous) => !previous)
              }
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
    marginBottom: 30,
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