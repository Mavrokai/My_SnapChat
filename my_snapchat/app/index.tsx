import { Audio } from "expo-av";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./index.styles";

export default function Index() {
  const router = useRouter();

  const handleRegister = async () => {
    const { status: cameraStatus } =
      await Camera.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await MediaLibrary.requestPermissionsAsync();
    const { status: audioStatus } = await Audio.requestPermissionsAsync();

    if (
      cameraStatus !== "granted" ||
      mediaStatus !== "granted" ||
      audioStatus !== "granted"
    ) {
      Alert.alert(
        "Permission requise",
        "L'application a besoin d'accéder à la caméra, au microphone et à la galerie pour fonctionner correctement."
      );
    } else {
      router.push("/auth/register");
    }
  };

  return (
    <>
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
