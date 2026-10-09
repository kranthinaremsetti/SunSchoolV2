import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "../../firebase/firebaseConfig";
import { loginUser } from "../../services/authService";
import { useNavigation } from "@react-navigation/native";

const schoolLogo = require("../../assets/images/school_logo_cropped.png");

export default function LoginScreen() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        "Missing Details",
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const user = await loginUser(email, password);

      if (!user) {
        Alert.alert("Login Failed", "User not found.");
        return;
      }

      if (user.status === "pending") {
        Alert.alert(
          "Pending Approval",
          "Your account is waiting for admin approval."
        );
        return;
      }

      if (user.status === "rejected") {
        Alert.alert(
          "Registration Rejected",
          "Your registration was rejected. Please contact the school."
        );
        return;
      }

      switch (user.role) {
        case "admin":
          navigation.replace("AdminDashboard");
          break;

        case "teacher":
          navigation.replace("TeacherDashboard");
          break;

        case "parent":
          navigation.replace("ParentDashboard");
          break;

        default:
          Alert.alert(
            "Login Error",
            "Your account has an invalid role. Please contact the school."
          );
      }
    } catch (error: any) {
      console.log("Login Error:", error);

      Alert.alert(
        "Login Failed",
        error?.message || "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert(
        "Enter Email",
        "Please enter your registered email address first."
      );
      return;
    }

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);

      Alert.alert(
        "Password Reset",
        "A password reset link has been sent to your email."
      );
    } catch (error: any) {
      console.log("Password Reset Error:", error);

      Alert.alert(
        "Reset Failed",
        error?.message || "Unable to send password reset email."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrapper}
      >
        <View style={styles.logoContainer}>
          <Image source={schoolLogo} style={styles.logo} />

          <Text style={styles.schoolName}>
            Sun School
          </Text>

          <Text style={styles.subtitle}>
            School Management System
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>
            Welcome Back 👋
          </Text>

          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <TouchableOpacity
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgot}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.loginButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginText}>
              {loading ? "LOGGING IN..." : "LOGIN"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            disabled={loading}
          >
            <Text style={styles.register}>
              New User? Register
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PRIMARY = "#1976D2";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  wrapper: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },

  schoolName: {
    fontSize: 32,
    fontWeight: "bold",
    color: PRIMARY,
    marginTop: 10,
  },

  subtitle: {
    color: "#777",
    marginTop: 5,
    fontSize: 15,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 22,
    elevation: 5,
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
  },

  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },

  forgot: {
    alignSelf: "flex-end",
    color: PRIMARY,
    marginBottom: 20,
  },

  loginButton: {
    backgroundColor: PRIMARY,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },

  register: {
    textAlign: "center",
    marginTop: 25,
    color: PRIMARY,
    fontWeight: "600",
  },
});