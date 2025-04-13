import { useState } from "react";
import LoginScreen from "./(tabs)/login";
<<<<<<< HEAD
import HomeScreen from "./(tabs)/homescreen";
=======
import HomeScreen from "./(tabs)/home3";
>>>>>>> da0550791669b7240162b3bb4533d3b0bba50cb7

export default function RootLayout() {
  const [userId, setUserId] = useState<number | null>(null);

  // Si no hay user_id, mostramos pantalla de login
  if (!userId) {
    return <LoginScreen onLoginSuccess={(id) => setUserId(id)} />;
  }

  // Si ya hay user_id, mostramos la pantalla principal
  return <HomeScreen userId={userId} />;
}
