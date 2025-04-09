import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="index" options={{ title: "Home" }}>
        {() => null}
      </Tab.Screen>
      {/* Add more screens here */}
    </Tab.Navigator>
  );
}
