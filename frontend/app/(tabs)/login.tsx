import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { User } from "./types";
import { loginUser } from "./routing";

export default function LoginScreen({
  onLoginSuccess,
}: {
  onLoginSuccess: (userId: number) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const user: User = { email, password };
    const loggingResponse = await loginUser(user);

    console.log("Logging response:", loggingResponse);

    if (loggingResponse.logged && loggingResponse.user_id) {
      onLoginSuccess(loggingResponse.user_id);
    } else if (loggingResponse.error) {
      setError(loggingResponse.error || "Login failed. Please try again.");
    }
  };

  return (
    <TouchableWithoutFeedback>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Image
          source={require("../../assets/images/logoapp.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {error ? (
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>{error}</Text>
          </TouchableOpacity>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5FCFF",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },
  input: {
    width: "80%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingLeft: 15,
    fontSize: 16,
  },
  forgotPassword: {
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#D00",
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: "#001F54", // Updated to navy blue
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
    marginTop: 10,
  },
  signInButtonText: {
    color: "#FFF", // Text color for the button
    fontSize: 16,
    fontWeight: "bold",
  },
});
