import React, {
  useEffect,
  useState,
} from "react";

import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
} from "../../services/adminService";

export default function PendingRegistrationsScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState("All");
  const loadUsers = async () => {
    const data = await getPendingUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (uid: string) => {
  try {
    console.log("Approving:", uid);

    await approveUser(uid);

    Alert.alert("Approved");

    loadUsers();
  } catch (error: any) {
    console.log("Approve Error:", error);
    Alert.alert("Error", error.message);
  }
};
  const handleReject = async (uid: string) => {
    try {
      console.log("Rejecting:", uid);

      await rejectUser(uid);

      Alert.alert("Rejected");

      loadUsers();
    } catch (error: any) {
      console.log("Reject Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.email}>
        {item.email}
      </Text>

      <Text>
        {item.mobile}
      </Text>
      <Text style={styles.role}>
        Role : {item.role}
      </Text>
      <View style={styles.row}>

        <TouchableOpacity
          style={styles.approve}
          onPress={() =>
            handleApprove(item.id)
          }
        >
          <Text style={styles.btnText}>
            Approve
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reject}
          onPress={() =>
            handleReject(item.id)
          }
        >
          <Text style={styles.btnText}>
            Reject
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );

  const filteredUsers = users.filter((user) => {
  if (filterRole === "All") return true;

  return user.role === filterRole.toLowerCase();
});
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>
  Filter By
</Text>

<View style={styles.pickerContainer}>
  <Picker
    selectedValue={filterRole}
    onValueChange={setFilterRole}
  >
    <Picker.Item
      label="All"
      value="All"
    />

    <Picker.Item
      label="Parents"
      value="Parents"
    />

    <Picker.Item
      label="Teachers"
      value="Teachers"
    />
  </Picker>
</View>
      <FlatList
        
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 40,
            }}
          >
            No Pending Registrations
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#F5F7FA",
    padding:15,
  },
  label: {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 5,
},

pickerContainer: {
  backgroundColor: "white",
  borderRadius: 10,
  marginBottom: 20,
  elevation: 2,
},

role: {
  color: "#1565C0",
  fontWeight: "bold",
  marginTop: 5,
},
  card:{
    backgroundColor:"white",
    padding:15,
    borderRadius:12,
    marginBottom:15,
    elevation:3,
  },

  email:{
    fontSize:18,
    fontWeight:"bold",
    marginBottom:5,
  },

  row:{
    flexDirection:"row",
    marginTop:15,
    justifyContent:"space-between",
  },

  approve:{
    backgroundColor:"green",
    padding:12,
    borderRadius:8,
    flex:1,
    marginRight:8,
    alignItems:"center",
  },

  reject:{
    backgroundColor:"red",
    padding:12,
    borderRadius:8,
    flex:1,
    marginLeft:8,
    alignItems:"center",
  },

  btnText:{
    color:"white",
    fontWeight:"bold",
  },
});