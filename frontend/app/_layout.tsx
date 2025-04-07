import { Slot, Redirect, usePathname } from "expo-router";
import HomeScreen from "./home";
import LoginScreen from "./login";

export default function RootLayout() {
  const pathname = usePathname();

  const isLoggedIn = true; // Cambia a true cuando simules login

  if (pathname == "/login") {
    return <LoginScreen />;
  }

  return <HomeScreen />;
}
