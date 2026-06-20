import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Register</Text>

      <Text style={styles.subtitle}>
        Choose your role
      </Text>

      <TouchableOpacity style={styles.button}
      onPress={() => navigation.navigate("ParentRegistration")}>
        <Text style={styles.buttonText}>
          Parent Registration
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}
      onPress={() => navigation.navigate("TeacherRegistration")}>
        <Text style={styles.buttonText}>
          Teacher Registration
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.back}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"center",
    padding:25,
    backgroundColor:"#fff"
  },

  title:{
    fontSize:30,
    fontWeight:"bold",
    textAlign:"center",
    marginBottom:15
  },

  subtitle:{
    textAlign:"center",
    fontSize:18,
    marginBottom:40
  },

  button:{
    backgroundColor:"#1E88E5",
    padding:18,
    borderRadius:12,
    marginBottom:20
  },

  buttonText:{
    color:"white",
    textAlign:"center",
    fontWeight:"bold",
    fontSize:18
  },

  back:{
    textAlign:"center",
    marginTop:20,
    color:"#1E88E5"
  }

});