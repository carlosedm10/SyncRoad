import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./home";

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  );
}

export default MyTabs;
