import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Fees</Text>

      {fees.map((fee) => (
        <View
          key={fee.firestoreId}
          style={styles.card}
        >
          <Text>Term: {fee.term}</Text>

          <Text>Amount: ₹{fee.amount}</Text>

          <Text>Status: {fee.status}</Text>
        </View>
      ))}
    </ScrollView>
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
});