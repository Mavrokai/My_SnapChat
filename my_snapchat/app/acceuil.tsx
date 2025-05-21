import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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
  const [mode] = useState<"picture" | "video">("picture");
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/auth/login");
      }
    };
    checkAuth();
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

  const recordVideo = async () => {
    if (recording) {
      setRecording(false);
      cameraRef.current?.stopRecording();
      return;
    }
    setRecording(true);
    if (cameraRef.current && "recordAsync" in cameraRef.current) {
      const video = await cameraRef.current.recordAsync();
      console.log({ video });
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

  return (
    <SafeAreaView style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />

      <View style={styles.topButtonsContainer}>
        <TouchableOpacity style={styles.button} onPress={openGallery}>
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
      </View>

      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.button} onPress={openGallery}>
          <Ionicons name="images" size={40} color="white" />
        </TouchableOpacity>
        <Pressable onPress={mode === "picture" ? takePicture : recordVideo}>
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
                    backgroundColor: mode === "picture" ? "white" : "red",
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
