import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/auth/SplashScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ParentRegistrationScreen from "../screens/auth/ParentRegistrationScreen";
import TeacherRegistrationScreen from "../screens/auth/TeacherRegistrationScreen";
import AdminLoginScreen from "../screens/auth/AdminLoginScreen";
import PendingRegistrationsScreen from "../screens/admin/PendingRegistrationsScreen";
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
  name="AdminLogin"
  component={AdminLoginScreen}
/>

<Stack.Screen
  name="PendingRegistrations"
  component={PendingRegistrationsScreen}
/>
    </Stack.Navigator>
  );
}