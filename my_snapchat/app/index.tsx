import { Stack , useRouter} from "expo-router";
import React from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./index.styles";
const router=useRouter();
export default function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("../assets/images/logos.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity testID="login" style={styles.login}>
            <Text style={styles.buttonText} onPress={()=> router.push("./auth/login")} >Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="register" style={styles.register}>
            <Text style={styles.buttonText}>S&apos;inscrire</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </>
  );
}
