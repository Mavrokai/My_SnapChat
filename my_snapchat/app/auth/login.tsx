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
      const response = await fetch(apiUrl, {
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
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Se connecter" onPress={handleLogin} />
    </View>
  );
}