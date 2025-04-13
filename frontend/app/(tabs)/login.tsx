import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
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

<<<<<<< HEAD
    //if (result.logged) {
    //onLoginSuccess();
    // router.replace("http://localhost:8081");
    //} else {
    //setError(result.error || "Login failed. Please try again.");
    //}

    if (result.logged && result.user_id) {
      // Guardamos el user_id localmente para usarlo en HomeScreen
      onLoginSuccess(result.user_id);
    } else {
      setError(result.error || "Login failed. Please try again.");
=======
    console.log("Logging response:", loggingResponse);

    if ("logged" in loggingResponse && loggingResponse.logged) {
      onLoginSuccess();
    } else if ("error" in loggingResponse) {
      setError(loggingResponse.error || "Login failed. Please try again.");
>>>>>>> da0550791669b7240162b3bb4533d3b0bba50cb7
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <Image
            source={require("../../assets/images/logo.png")}
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

          <Button title="Sign In" onPress={handleLogin} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
});
