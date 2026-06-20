import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
const schoolLogo = require("../../assets/images/school_logo_cropped.png");
export default function LoginScreen() {
  const navigation = useNavigation<any>();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    alert("Firebase Login will be added next.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrapper}
      >
        <View style={styles.logoContainer}>
          <Image
            source={schoolLogo}
            style={styles.logo}
          />
          <Text style={styles.schoolName}>Sun School</Text>
          <Text style={styles.subtitle}>
            School Management System
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Welcome Back 👋</Text>

          <TextInput
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
            style={styles.input}
            maxLength={10}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <TouchableOpacity>
            <Text style={styles.forgot}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginText}>LOGIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Register")
            }
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