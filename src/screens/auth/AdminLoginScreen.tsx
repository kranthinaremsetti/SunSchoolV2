import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";

export default function AdminLoginScreen() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (
      email === "admin@sunschool.com" &&
      password === "admin123"
    ) {
      navigation.replace("PendingRegistrations");
    } else {
      Alert.alert(
        "Login Failed",
        "Invalid Admin Credentials"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          Admin Login
        </Text>

        <AppInput
          placeholder="Admin Email"
          value={email}
          onChangeText={setEmail}
        />

        <AppInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <AppButton
          title="Login"
          onPress={handleLogin}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"center",
    backgroundColor:"#F5F7FA",
    padding:20,
  },

  card:{
    backgroundColor:"white",
    padding:20,
    borderRadius:15,
    elevation:4,
  },

  title:{
    fontSize:28,
    fontWeight:"bold",
    color:"#1565C0",
    textAlign:"center",
    marginBottom:25,
  },
});