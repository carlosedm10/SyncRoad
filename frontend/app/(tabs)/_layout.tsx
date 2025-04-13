import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./homescreen"; // usamos el nuevo componente

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Inicio" component={HomeScreen} />
    </Tab.Navigator>
  );
}

export default MyTabs;
