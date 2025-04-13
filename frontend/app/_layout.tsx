import { useState } from "react";
import LoginScreen from "./(tabs)/login";
import HomeScreen from "./(tabs)/homescreen";

export default function RootLayout() {
  const [userId, setUserId] = useState<number | null>(null);

  // Si no hay user_id, mostramos pantalla de login
  if (!userId) {
    return <LoginScreen onLoginSuccess={(id) => setUserId(id)} />;
  }

  // Si ya hay user_id, mostramos la pantalla principal
  return <HomeScreen userId={userId} />;
}
