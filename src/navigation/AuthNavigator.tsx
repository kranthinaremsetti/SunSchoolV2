import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StudentManagementScreen from "../screens/admin/StudentManagementScreen";
import SplashScreen from "../screens/auth/SplashScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ParentRegistrationScreen from "../screens/auth/ParentRegistrationScreen";
import TeacherRegistrationScreen from "../screens/auth/TeacherRegistrationScreen";
import PendingRegistrationsScreen from "../screens/admin/PendingRegistrationsScreen";
import AdminDashboard from "../screens/admin/AdminDashboard";
import TeacherDashboard from "../screens/teacher/TeacherDashboard";
import ParentDashboard from "../screens/parent/ParentDashboard";
const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />
      <Stack.Screen
  name="ParentRegistration"
  component={ParentRegistrationScreen}
  options={{ title: "Parent Registration" }}
/>
<Stack.Screen
  name="TeacherRegistration"
  component={TeacherRegistrationScreen}
  options={{ title: "Teacher Registration" }}
/>

<Stack.Screen
  name="PendingRegistrations"
  component={PendingRegistrationsScreen}
/>
<Stack.Screen
name="ParentDashboard"
component={ParentDashboard}
/>

<Stack.Screen
name="TeacherDashboard"
component={TeacherDashboard}
/>

<Stack.Screen
name="AdminDashboard"
component={AdminDashboard}
/>
<Stack.Screen
  name="StudentManagement"
  component={StudentManagementScreen}
/>
    </Stack.Navigator>
  );
}