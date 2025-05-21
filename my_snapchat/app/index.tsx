import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, Text, TouchableOpacity, View , Alert} from "react-native";
import styles from "./index.styles";
import { Camera } from "expo-camera";
export default function Index() {
  const router = useRouter();
//Pour permettre la permission
const handleRegister=async()=>{
  const { status } = await Camera.requestCameraPermissionsAsync();
  if(status !== "granted"){
    Alert.alert("Permission à la caméra requise!");
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
