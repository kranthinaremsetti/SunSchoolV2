import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from "react-native";

import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase/firebaseConfig";
import { getFees } from "../../services/feeService";

export default function FeesScreen() {
  const [fees, setFees] = useState<any[]>([]);

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      const userSnap = await getDoc(doc(db, "users", uid));

      if (!userSnap.exists()) return;

      const user: any = userSnap.data();

      const allFees = await getFees();

      setFees(
        allFees.filter(
          (fee) => fee.studentId === user.studentId
        )
      );

    } catch (e) {
      console.log(e);
    }
  };

  return (
    
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Fees</Text>

      {fees.length === 0 ? (
  <Text style={styles.empty}>
    No fee records available.
  </Text>
) : (
  fees.map((fee) => (
    <View
      key={fee.firestoreId}
      style={styles.card}
    >
      <Text style={styles.feeType}>
        💰 {fee.feeType}
      </Text>

      <Text style={styles.info}>
        🎓 Academic Year: {fee.academicYear}
      </Text>

      <Text style={styles.info}>
        💵 Total Fee: ₹{fee.totalFee}
      </Text>

      <Text style={styles.info}>
        ✅ Paid Amount: ₹{fee.paidAmount}
      </Text>

      <Text style={styles.info}>
        ❗ Due Amount: ₹{fee.dueAmount}
      </Text>

      <Text style={styles.info}>
        📅 Due Date: {fee.dueDate}
      </Text>

      <Text
        style={[
          styles.status,
          {
            color:
              fee.status === "Paid"
                ? "green"
                : fee.status === "Partially Paid"
                ? "#F59E0B"
                : "red",
          },
        ]}
      >
        {fee.status}
      </Text>
    </View>
  ))
)}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  feeType: {
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 10,
},

info: {
  fontSize: 15,
  color: "#444",
  marginTop: 5,
},

status: {
  marginTop: 15,
  fontSize: 17,
  fontWeight: "bold",
},

empty: {
  textAlign: "center",
  marginTop: 40,
  fontSize: 16,
  color: "gray",
},
});