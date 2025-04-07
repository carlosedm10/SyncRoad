import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { loginUser } from "./routing";
import { User } from "./types";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    // Construct the user object
    const user: User = { email, password };

    // Call the login API
    const result = await loginUser(user);

    if (result.success) {
      console.log("Login successful, user id:", result.userId);
      // Replace with your route (e.g., home screen)
      router.replace("http://localhost:8081");
    } else {
      // Show error alert
      Alert.alert("Login Failed", result.error || "An error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome Back!</Text>

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

      <View style={styles.checkboxContainer}>
        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
          <View style={[styles.checkbox, rememberMe && styles.checked]} />
        </TouchableOpacity>
        <Text style={styles.checkboxText}>Remember me</Text>
      </View>

      <Button title="Sign In" onPress={handleLogin} />

      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>
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
    width: "50%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingLeft: 15,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderColor: "#aaa",
    borderWidth: 1,
    marginRight: 10,
  },
  checked: {
    backgroundColor: "#4A90E2",
  },
  checkboxText: {
    fontSize: 16,
  },
  forgotPassword: {
    marginTop: 15,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#4A90E2",
  },
});
