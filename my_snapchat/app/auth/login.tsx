import React,{ useState } from "react";
import {View,TextInput,Button,Text,StyleSheet } from "react-native";
import {useRouter} from "expo-router";
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const apiKey = process.env.EXPO_PUBLIC_API_KEY;

export default function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  console.log(apiUrl);
  console.log(apiKey);
  const handleLogin = async () => {
    setError("");
    try {
      const response = await fetch(apiUrl || "", {
        method: "PUT",
        headers: {
          "x-api-key": apiKey || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        throw new Error("Identifiants invalides");
      }
      const data = await response.json();
      console.log(data);
      router.push("/auth/home");
    } catch (error: any) {
      setError(error.message);
    }
  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#fff",
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 24,
          textAlign: "center",
          color: "#333",
        }}
      >
        Connexion
      </Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontSize: 16,
          backgroundColor: "#f9f9f9",
        }}
      />
      <TextInput
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontSize: 16,
          backgroundColor: "#f9f9f9",
        }}
      />
      <View style={{ borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
        <Button title="Se connecter" onPress={handleLogin} color="blue" />
      </View>
      {error ? (
        <Text style={{ color: "red", textAlign: "center", marginTop: 8 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}