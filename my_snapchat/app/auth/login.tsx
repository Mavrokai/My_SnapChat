import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./login.styles";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const apiKey = process.env.EXPO_PUBLIC_API_KEY;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isLoading, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleLogin = useCallback(
    async (emailToUse = email, passwordToUse = password) => {
      setError("");
      try {
        const response = await fetch(apiUrl || "", {
          method: "PUT",
          headers: {
            "x-api-key": apiKey || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: emailToUse, password: passwordToUse }),
        });
        if (!response.ok) {
          throw new Error("Identifiants invalides");
        }
        const data = await response.json();

        await AsyncStorage.setItem("userToken", data.data.token);
        await AsyncStorage.setItem("userEmail", emailToUse);
        await AsyncStorage.setItem("userUsername", data.data.username || "");
        await AsyncStorage.setItem("userData", JSON.stringify(data.data));

        if (rememberMe) {
          await AsyncStorage.setItem("savedEmail", emailToUse);
          await AsyncStorage.setItem("savedPassword", passwordToUse);
          await AsyncStorage.setItem("rememberMe", "true");
        } else {
          await AsyncStorage.removeItem("savedEmail");
          await AsyncStorage.removeItem("savedPassword");
          await AsyncStorage.removeItem("rememberMe");
        }

        router.replace("../acceuil");
      } catch (error: any) {
        setError(error.message);
      }
    },
    [email, password, rememberMe, router]
  );

  const checkAutoLogin = useCallback(async () => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      const rememberMeValue = await AsyncStorage.getItem("rememberMe");

      if (userToken && rememberMeValue !== "true") {
        await AsyncStorage.multiRemove([
          "userToken",
          "userEmail",
          "userUsername",
          "userData",
          "savedEmail",
          "savedPassword",
          "rememberMe",
        ]);
        setIsLoading(false);
        return;
      }

      if (userToken && rememberMeValue === "true") {
        router.replace("../acceuil");
        return;
      }

      const savedEmail = await AsyncStorage.getItem("savedEmail");
      const savedPassword = await AsyncStorage.getItem("savedPassword");

      if (rememberMeValue === "true" && savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
        await handleLogin(savedEmail, savedPassword);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vÃ©rification de la connexion automatique:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  }, [handleLogin, router]);

  useEffect(() => {
    checkAutoLogin();
  }, [checkAutoLogin]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[styles.loadingSpinner, { transform: [{ rotate: spin }] }]}
        >
          <ActivityIndicator size="large" color="#FD3E83" />
        </Animated.View>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="rgba(255,255,255,0.5)"
      />
      <TextInput
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="rgba(255,255,255,0.5)"
      />
      <View style={styles.rememberMeContainer}>
        <Switch
          value={rememberMe}
          onValueChange={setRememberMe}
          trackColor={{ false: "#767577", true: "#FD3E83" }}
          thumbColor={rememberMe ? "#fff" : "#f4f3f4"}
        />
        <Text style={styles.rememberMeText}>Se souvenir de moi</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleLogin()}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}