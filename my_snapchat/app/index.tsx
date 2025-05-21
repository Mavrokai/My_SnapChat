import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, Text, TouchableOpacity, View , Alert} from "react-native";
import styles from "./index.styles";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
export default function Index() {
  const router = useRouter();
//Pour permettre la permission
const handleRegister=async()=>{
  const { status : cameraStatus } = await Camera.requestCameraPermissionsAsync();
  const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
  if(cameraStatus !== "granted" && mediaStatus !== "granted"){
    Alert.alert("Permission à la caméra et la gallerie requise!");
  }
  else{
    router.push("/auth/register");
  }

}

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
