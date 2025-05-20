import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";


const API_URL = "https://snapchat.epihub.eu/user";
const API_KEY = process.env.EXPO_PUBLIC_API_KEY_BRYAN;
export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleRegister = async () => {
    console.log("Clé API chargée:", process.env.EXPO_PUBLIC_API_KEY_BRYAN);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY || "",
          "Content-Type": "application/json",
          "Accept": "application/json",
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
      } else {
        Alert.alert("Erreur", data.data || "Impossible de s'inscrire");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue");
      console.error("Erreur d'inscription", error);
    }
  };




  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />
      <TextInput placeholder="Mot de passe" style={styles.input} secureTextEntry onChangeText={setPassword} />
      <TextInput placeholder="Username" style={styles.input} onChangeText={setUsername} />
      <Button title="S'inscrire" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "80%", padding: 10, marginBottom: 15, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 },
});