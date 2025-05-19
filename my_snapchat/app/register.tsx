import React from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function Register() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <TextInput placeholder="Email" style={styles.input} />
      <TextInput placeholder="Mot de passe" style={styles.input} secureTextEntry />
      <TextInput placeholder="Username" style={styles.input} />
      <Button title="S'inscrire" onPress={() => console.log("Inscription en cours...")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
});
