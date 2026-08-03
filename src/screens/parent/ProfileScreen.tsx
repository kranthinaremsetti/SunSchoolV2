import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../../firebase/firebaseConfig";

export default function ProfileScreen() {

  const [loading, setLoading] = useState(true);

  // Parent Details
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [mobile, setMobile] = useState("");
  const [aadhaar, setAadhaar] = useState("");

  // Student Details
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {

      const uid = auth.currentUser?.uid;

      if (!uid) return;

      // ------------------------
      // Users Collection
      // ------------------------

      const userSnap = await getDoc(
        doc(db, "users", uid)
      );

      if (!userSnap.exists()) return;

      const user: any = userSnap.data();

      setMobile(user.mobile || "");

      // ------------------------
      // Parents Collection
      // ------------------------

      const parentSnap = await getDoc(
        doc(db, "parents", uid)
      );

      if (parentSnap.exists()) {

        const parent: any =
          parentSnap.data();

        setFatherName(
          parent.fatherName || ""
        );

        setMotherName(
          parent.motherName || ""
        );

        setAadhaar(
          parent.aadhaar || ""
        );
      }

      // ------------------------
      // Students Collection
      // ------------------------

      if (user.studentId) {

        const studentSnap =
          await getDoc(
            doc(
              db,
              "students",
              user.studentId
            )
          );

        if (studentSnap.exists()) {

          setStudent({
            id: studentSnap.id,
            ...studentSnap.data(),
          });

        }
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

      // Update Parent

      await updateDoc(
        doc(db, "parents", uid),
        {
          fatherName,
          motherName,
          aadhaar,
        }
      );

      // Update User

      await updateDoc(
        doc(db, "users", uid),
        {
          mobile,
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
          Parent Profile
        </Text>

        {/* Parent Details */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Parent Details
          </Text>

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
            placeholder="Aadhaar Number"
            keyboardType="numeric"
            value={aadhaar}
            onChangeText={setAadhaar}
          />

          <AppButton
            title="Save Changes"
            onPress={saveProfile}
          />

        </View>

        {/* Student Details */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Student Details
          </Text>

          <Text style={styles.label}>
            Student Name
          </Text>

          <Text style={styles.value}>
            {student?.studentName || "-"}
          </Text>

          <Text style={styles.label}>
            Roll Number
          </Text>

          <Text style={styles.value}>
            {student?.rollNo || "-"}
          </Text>

          <Text style={styles.label}>
            Class
          </Text>

          <Text style={styles.value}>
            {student?.className || "-"}
          </Text>

          <Text style={styles.label}>
            Section
          </Text>

          <Text style={styles.value}>
            {student?.section || "-"}
          </Text>

          <Text style={styles.label}>
            Date of Birth
          </Text>

          <Text style={styles.value}>
            {student?.dob || "-"}
          </Text>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
  
  };
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