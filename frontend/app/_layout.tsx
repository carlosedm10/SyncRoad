import { Slot, Redirect, usePathname } from "expo-router";
import HomeScreen from "./home";
import LoginScreen from "./login";

export default function RootLayout() {
  const pathname = usePathname();

  const isLoggedIn = true; // Cambia a true cuando simules login

  // // Corrige la ruta sin paréntesis
  // if (!isLoggedIn && pathname !== "/login") {
  //   return <Redirect href="/login" />;
  // }

  return <HomeScreen />;
}
