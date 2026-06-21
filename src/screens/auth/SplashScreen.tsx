import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function SplashScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    checkLogin();
  }, []);

  async function checkLogin() {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setTimeout(() => {
          navigation.replace("Login");
        }, 1500);
        return;
      }

      const userDoc = await getDoc(
        doc(db, "users", currentUser.uid)
      );

      if (!userDoc.exists()) {
        navigation.replace("Login");
        return;
      }

      const user: any = userDoc.data();

      if (user.status !== "approved") {
        navigation.replace("Login");
        return;
      }

      switch (user.role) {
        case "admin":
          navigation.replace("AdminDashboard");
          break;

        case "teacher":
          navigation.replace("TeacherDashboard");
          break;

        case "parent":
          navigation.replace("ParentDashboard");
          break;

        default:
          navigation.replace("Login");
      }
    } catch (e) {
      console.log(e);
      navigation.replace("Login");
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1565C0",
      }}
    >
      <Text
        style={{
          fontSize: 34,
          fontWeight: "bold",
          color: "white",
        }}
      >
        Sun School
      </Text>

      <ActivityIndicator
        size="large"
        color="white"
        style={{ marginTop: 20 }}
      />
    </View>
  );
}