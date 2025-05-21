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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        router.replace("/acceuil");
        return;
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

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
