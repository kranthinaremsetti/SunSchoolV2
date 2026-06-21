import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

const MENU = [
  "Attendance",
  "Homework",
  "Fees",
  "Results",
  "Leave",
  "Announcements",
  "Holidays",
  "Timetable",
  "Profile",
];

export default function ParentDashboard() {
  return (
    <SafeAreaView style={styles.container}>

      <ScrollView>

        <View style={styles.header}>
          <Text style={styles.school}>
            Sun School
          </Text>

          <Text style={styles.welcome}>
            Welcome 👋
          </Text>

          <Text style={styles.student}>
            Student : Ravi Kumar
          </Text>

        </View>

        <View style={styles.grid}>

          {MENU.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.card}
            >
              <Text style={styles.cardText}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const PRIMARY="#1565C0";

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F5F7FA"
},

header:{
backgroundColor:PRIMARY,
padding:25,
borderBottomLeftRadius:25,
borderBottomRightRadius:25,
},

school:{
fontSize:28,
fontWeight:"bold",
color:"white",
},

welcome:{
fontSize:20,
color:"white",
marginTop:20,
},

student:{
fontSize:18,
color:"white",
marginTop:8,
},

grid:{
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"space-evenly",
padding:15,
},

card:{
backgroundColor:"white",
width:"45%",
height:110,
borderRadius:15,
justifyContent:"center",
alignItems:"center",
marginBottom:15,
elevation:4,
},

cardText:{
fontSize:17,
fontWeight:"bold",
textAlign:"center",
}

});