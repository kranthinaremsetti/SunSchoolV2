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

import {
  getPendingUsers,
  approveUser,
  rejectUser,
} from "../../services/adminService";

export default function PendingRegistrationsScreen() {
  const [users, setUsers] = useState<any[]>([]);

  const loadUsers = async () => {
    const data = await getPendingUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (uid: string) => {
    await approveUser(uid);
    Alert.alert("Approved");
    loadUsers();
  };

  const handleReject = async (uid: string) => {
    await rejectUser(uid);
    Alert.alert("Rejected");
    loadUsers();
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.email}>
        {item.email}
      </Text>

      <Text>
        {item.mobile}
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

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={users}
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