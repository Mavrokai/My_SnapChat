import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./index.styles";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Demander les permissions dans tous les cas
        const { status: cameraStatus } =
          await Camera.requestCameraPermissionsAsync();
        const { status: mediaStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        // Vérifier l'authentification
        const token = await AsyncStorage.getItem("userToken");
        if (token && cameraStatus === "granted" && mediaStatus === "granted") {
          router.replace("/");
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router]);

  const handleRegister = async () => {
    router.push("/auth/register");
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.background,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#FD3E83" />
        <Text
          style={{
            color: "#FD3E83",
            marginTop: 20,
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Chargement...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <ImageBackground
        source={require("../assets/images/logos.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            testID="login"
            style={styles.login}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="register"
            style={styles.register}
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>S&apos;inscrire</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </>
  );
}
