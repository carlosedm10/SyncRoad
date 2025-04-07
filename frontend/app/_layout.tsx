import { usePathname } from "expo-router";
import HomeScreen from "./home";
import LoginScreen from "./login";

export default function RootLayout() {
  const pathname = usePathname();

  if (pathname == "/login") {
    return <LoginScreen />;
  }

  return <HomeScreen />;
}
