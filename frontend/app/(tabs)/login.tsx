import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { User } from "./types";
import { loginUser } from "./routing";

export default function LoginScreen({
  onLoginSuccess,
}: {
  onLoginSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const user: User = { email, password };
    const loggingResponse = await loginUser(user);

    console.log("Logging response:", loggingResponse);

    if (loggingResponse.logged) {
      onLoginSuccess();
      // router.replace("http://localhost:8081");
    } else {
      setError(loggingResponse.error || "Login failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome Back!</Text>

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

      <Button title="Sign In" onPress={handleLogin} />
    </View>
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
});
