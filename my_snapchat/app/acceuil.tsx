import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  AppState,
  Image,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./acceuil.styles";

export default function App() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [flash, setFlash] = useState<"off" | "on">("off");

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/auth/login");
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (nextAppState === "background") {
          const rememberMe = await AsyncStorage.getItem("rememberMe");
          if (rememberMe !== "true") {
            await AsyncStorage.multiRemove([
              "userToken",
              "userEmail",
              "userUsername",
              "userData",
            ]);
            router.replace("/auth/login");
          }
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [router]);

  if (!permission || !permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Permission caméra refusée</Text>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && "takePictureAsync" in cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      console.log({ photo });
      router.push({
        pathname: "/select-recipient",
        params: { imageUri: photo.uri },
      });
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      router.push({
        pathname: "/select-recipient",
        params: { imageUri: result.assets[0].uri },
      });
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "userToken",
        "userEmail",
        "userUsername",
        "userData",
        "savedEmail",
        "savedPassword",
        "rememberMe",
      ]);
      router.replace("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        zoom={zoom}
        flash={flash}
      />

      <View style={styles.topButtonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Image
            source={require("../assets/images/userProfil.png")}
            style={{ width: 40, height: 40 }}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Image
            source={require("../assets/images/flipcamera.png")}
            style={{ width: 40, height: 40 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setFlash(flash === "off" ? "on" : "off")}
        >
          <Ionicons
            name={flash === "off" ? "flash-off" : "flash"}
            size={40}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.menuText}>Profil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.zoomContainer}>
        <Slider
          style={{ width: 200, height: 40 }}
          minimumValue={0}
          maximumValue={1}
          value={zoom}
          onValueChange={setZoom}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
      </View>

      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.button} onPress={openGallery}>
          <Ionicons name="images" size={40} color="white" />
        </TouchableOpacity>
        <Pressable onPress={takePicture}>
          {({ pressed }) => (
            <View
              style={[
                styles.shutterBtn,
                {
                  opacity: pressed ? 0.5 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.shutterBtnInner,
                  {
                    backgroundColor: "white",
                  },
                ]}
              />
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
