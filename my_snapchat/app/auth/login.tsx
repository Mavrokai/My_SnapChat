import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = () =>{
    if(email && password){
      
    }
  }
  return (
    <View>
      <TextInput placeholder="Email/Nom utilisateur" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Connexion" onPress={handleLogin} />
    </View>
  )};