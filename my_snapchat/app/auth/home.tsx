import React from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Bienvenue sur My_Snapchat !</Text>
      <Button title="Déconnexion" onPress={() => router.replace("/auth/login")} />
    </View>
  );
}