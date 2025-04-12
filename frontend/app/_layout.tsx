import { Slot, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import LoginScreen from "./(tabs)/login";
import HomeScreen from "./(tabs)/home3";

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // TODO: Replace with actual auth logic (like checking token or user state)
  useEffect(() => {
    const checkLoginStatus = async () => {
      // Simulate a logged-out state for now
      setIsLoggedIn(false);
    };
    checkLoginStatus();
  }, []);

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return <HomeScreen />;
}
