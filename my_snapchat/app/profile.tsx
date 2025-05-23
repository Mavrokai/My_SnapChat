import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

const getApiUrl = () => {
  const baseUrl = API_URL || "";
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
};

export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erreur lors du décodage du JWT:", error);
    return null;
  }
};

const resizeImage = async (uri: string): Promise<string> => {
  try {
    console.log("Début du redimensionnement de l'image");
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800, height: 800 } }],
      {
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
        compress: 0.9,
      }
    );

    if (manipResult.base64) {
      console.log("Image redimensionnée avec succès");
      return `data:image/jpeg;base64,${manipResult.base64}`;
    }
    console.log("Retour de l'image originale car pas de base64");
    return uri;
  } catch (error) {
    console.error("Erreur lors du redimensionnement de l'image:", error);
    return uri;
  }
};

export default function Profile() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(true);
  const [bearerToken, setBearerToken] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        console.log("Token récupéré:", token ? "Présent" : "Absent");
        if (!token) {
          router.replace("/");
          return;
        }
        setBearerToken(token);

        const storedEmail = await AsyncStorage.getItem("userEmail");
        const storedUsername = await AsyncStorage.getItem("userUsername");
        const storedProfilePicture = await AsyncStorage.getItem(
          "userProfilePicture"
        );
        console.log("Données utilisateur chargées:", {
          storedEmail,
          storedUsername,
          hasProfilePicture: !!storedProfilePicture,
        });

        setEmail(storedEmail || "");
        setUsername(storedUsername || "");

        try {
          console.log(
            "Tentative de récupération de la photo de profil depuis l'API"
          );
          const response = await fetch(`${getApiUrl()}`, {
            method: "GET",
            headers: {
              "x-api-key": API_KEY || "",
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          console.log("Statut de la réponse API:", response.status);
          const responseText = await response.text();
          console.log("Réponse brute de l'API:", responseText);

          if (response.ok) {
            const data = JSON.parse(responseText);
            console.log("Données de l'API:", {
              hasData: !!data.data,
              hasProfilePicture: !!(data.data && data.data.profilePicture),
            });

            if (data.data && data.data.profilePicture) {
              console.log("Photo de profil trouvée dans l'API");
              const profilePic = data.data.profilePicture;
              setProfilePicture(profilePic);
              await AsyncStorage.setItem("userProfilePicture", profilePic);
            } else {
              console.log("Aucune photo de profil trouvée dans l'API");
              if (storedProfilePicture) {
                console.log("Utilisation de la photo stockée localement");
                setProfilePicture(storedProfilePicture);
              }
            }
          } else {
            console.log("Erreur API:", response.status);
            if (storedProfilePicture) {
              console.log(
                "Utilisation de la photo stockée localement après erreur API"
              );
              setProfilePicture(storedProfilePicture);
            }
          }
        } catch (apiError) {
          console.error(
            "Erreur lors de la récupération de la photo de profil:",
            apiError
          );
          if (storedProfilePicture) {
            console.log(
              "Utilisation de la photo stockée localement après erreur"
            );
            setProfilePicture(storedProfilePicture);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleImagePick = async () => {
    try {
      console.log("Début de la sélection d'image");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
        allowsMultipleSelection: false,
        exif: false,
      });

      console.log("Résultat de la sélection:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log("Image sélectionnée:", result.assets[0].uri);
        const maxSize = 500000;

        if (result.assets[0].base64) {
          const base64Data = result.assets[0].base64;
          if (base64Data.length > maxSize) {
            console.log("Image trop grande, redimensionnement en cours...");
            const resizedImage = await resizeImage(result.assets[0].uri);
            setProfilePicture(resizedImage);
          } else {
            setProfilePicture(`data:image/jpeg;base64,${base64Data}`);
          }
        } else {
          const response = await fetch(result.assets[0].uri);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onload = async () => {
            const base64data = reader.result as string;
            if (base64data.length > maxSize) {
              console.log("Image trop grande, redimensionnement en cours...");
              const resizedImage = await resizeImage(result.assets[0].uri);
              setProfilePicture(resizedImage);
            } else {
              setProfilePicture(base64data);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la sélection de l'image"
      );
    }
  };

  const handleUpdateProfile = async () => {
    if (!bearerToken) {
      console.log("Tentative de mise à jour sans token");
      Alert.alert("Erreur", "Non authentifié");
      return;
    }

    try {
      console.log("Début de la mise à jour du profil");

      if (!username && !email && !password && !profilePicture) {
        Alert.alert(
          "Attention",
          "Veuillez modifier au moins un champ avant de mettre à jour le profil.",
          [{ text: "OK" }]
        );
        return;
      }

      const apiUrl = getApiUrl();
      console.log("URL de l'API:", `${apiUrl}`);

      const finalProfilePicture =
        profilePicture ||
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

      console.log("Données à envoyer:", {
        email: email || undefined,
        username: username || undefined,
        hasPassword: !!password,
        hasProfilePicture: !!finalProfilePicture,
        profilePictureSize: finalProfilePicture.length,
      });

      setLoading(true);
      const response = await fetch(`${apiUrl}`, {
        method: "PATCH",
        headers: {
          "x-api-key": API_KEY || "",
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || undefined,
          username: username || undefined,
          password: password || undefined,
          profilePicture: finalProfilePicture,
        }),
      });

      console.log("Statut de la réponse:", response.status);

      let data;
      const responseText = await response.text();
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Erreur de parsing de la réponse:", responseText, error);
        throw new Error("Réponse invalide du serveur");
      }

      console.log("Réponse du serveur:", data);

      if (response.ok) {
        console.log("Mise à jour réussie, sauvegarde des données locales");

        await AsyncStorage.multiRemove([
          "userToken",
          "userEmail",
          "userUsername",
          "userData",
          "userProfilePicture",
          "savedEmail",
          "savedPassword",
          "rememberMe",
        ]);

        if (email) await AsyncStorage.setItem("userEmail", email);
        if (username) await AsyncStorage.setItem("userUsername", username);
        if (finalProfilePicture)
          await AsyncStorage.setItem("userProfilePicture", finalProfilePicture);

        Alert.alert(
          "Succès",
          "Votre profil a été mis à jour avec succès. Vous allez être déconnecté pour appliquer les changements.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/"),
            },
          ]
        );
      } else {
        console.log("Erreur de mise à jour:", data);
        if (response.status === 404) {
          Alert.alert(
            "Erreur",
            "Utilisateur non trouvé. Veuillez vous reconnecter."
          );
          router.replace("/auth/login");
        } else if (data.data === "User not found or credentials are bad.") {
          Alert.alert(
            "Erreur",
            "Session expirée ou invalide. Veuillez vous reconnecter."
          );
          router.replace("/auth/login");
        } else if (
          data.data ===
          "An image (PNG/JPG/JPEG) base64 encoded should be provided."
        ) {
          Alert.alert(
            "Erreur",
            "Une image de profil est requise. Veuillez en sélectionner une."
          );
        } else {
          Alert.alert(
            "Erreur",
            data.data || "Impossible de mettre à jour le profil"
          );
        }
      }
    } catch (error) {
      console.error("Erreur détaillée de mise à jour:", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la mise à jour du profil"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD3E83" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mon Profil</Text>
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={handleImagePick}
            style={styles.profileImageContainer}
          >
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>+</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Changer la photo</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur (laisser vide pour ne pas modifier)"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
          <TextInput
            style={styles.input}
            placeholder="Email (laisser vide pour ne pas modifier)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
          <TextInput
            style={styles.input}
            placeholder="Nouveau mot de passe (laisser vide pour ne pas modifier)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="rgba(255,255,255,0.5)"
          />

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateProfile}
          >
            <Text style={styles.updateButtonText}>Mettre à jour</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    color: "#fff",
    fontSize: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 20,
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 10,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageText: {
    color: "#fff",
    fontSize: 40,
  },
  changePhotoText: {
    color: "#FD3E83",
    fontSize: 16,
  },
  form: {
    padding: 20,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: "#fff",
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: "#FD3E83",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
});
