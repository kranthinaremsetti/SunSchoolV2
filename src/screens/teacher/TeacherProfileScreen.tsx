import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
} from "react-native";

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../../firebase/firebaseConfig";

export default function TeacherProfileScreen() {
  const [loading, setLoading] = useState(true);

  const [teacherName, setTeacherName] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [qualification, setQualification] =
    useState("");

  const [experience, setExperience] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      // Users

      const userSnap = await getDoc(
        doc(db, "users", uid)
      );

      if (userSnap.exists()) {
        const user: any = userSnap.data();

        setEmail(user.email || "");
        setMobile(user.mobile || "");
      }

      // Teachers

      const teacherSnap = await getDoc(
        doc(db, "teachers", uid)
      );

      if (teacherSnap.exists()) {
        const teacher: any =
          teacherSnap.data();

        setTeacherName(
          teacher.teacherName || ""
        );

        setSubject(
          teacher.subject || ""
        );

        setQualification(
          teacher.qualification || ""
        );

        setExperience(
          teacher.experience || ""
        );
      }

    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      await updateDoc(
        doc(db, "users", uid),
        {
          mobile,
        }
      );

      await updateDoc(
        doc(db, "teachers", uid),
        {
          qualification,
          experience,
        }
      );

      Alert.alert(
        "Success",
        "Profile Updated Successfully"
      );

    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        "Failed to update profile."
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Teacher Profile
        </Text>

        {/* Read Only */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Teacher Details
          </Text>

          <Text style={styles.label}>
            Teacher Name
          </Text>

          <Text style={styles.value}>
            {teacherName}
          </Text>

          <Text style={styles.label}>
            Subject
          </Text>

          <Text style={styles.value}>
            {subject}
          </Text>

          <Text style={styles.label}>
            Email
          </Text>

          <Text style={styles.value}>
            {email}
          </Text>

        </View>

        {/* Editable */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Editable Details
          </Text>

          <AppInput
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
          />

          <AppInput
            placeholder="Qualification"
            value={qualification}
            onChangeText={
              setQualification
            }
          />

          <AppInput
            placeholder="Experience"
            value={experience}
            onChangeText={
              setExperience
            }
          />

          <AppButton
            title="Save Changes"
            onPress={saveProfile}
          />

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1565C0",
    marginBottom: 15,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    color: "#374151",
  },

  value: {
    fontSize: 17,
    marginTop: 5,
    color: "#6B7280",
  },

});