import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./register.styles";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          router.replace("/acceuil");
          return;
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleRegister = async () => {
    try {
      const response = await fetch(API_URL || "", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY || "",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          profilePicture: "",
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Inscription réussie", "Tu peux maintenant te connecter !");
        router.push("/auth/login");
      } else {
        Alert.alert("Erreur", data.data || "Impossible de s'inscrire");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue");
      console.error("Erreur d'inscription", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FD3E83" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <TextInput
        placeholder="Username"
        style={styles.input}
        onChangeText={setUsername}
        placeholderTextColor="rgba(255,255,255,0.5)"
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        onChangeText={setEmail}
        autoCapitalize="none"
        placeholderTextColor="rgba(255,255,255,0.5)"
      />
      <TextInput
        placeholder="Mot de passe"
        style={styles.input}
        secureTextEntry
        onChangeText={setPassword}
        placeholderTextColor="rgba(255,255,255,0.5)"
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>S&apos;inscrire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
