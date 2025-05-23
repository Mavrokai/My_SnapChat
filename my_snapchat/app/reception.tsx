import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles/reception.styles";

const API_URL_SNAP = process.env.EXPO_PUBLIC_API_URLSNAP;
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

interface Snap {
  _id: string;
  from: string;
  date: string;
  duration: number;
  image: string;
}

interface User {
  _id: string;
  username: string;
  profilePicture?: string;
}

export default function Reception() {
  const router = useRouter();
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapDetails, setSnapDetails] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewingSnapId, setViewingSnapId] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [users, setUsers] = useState<{ [key: string]: User }>({});

  const fetchUserInfo = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return null;

      const response = await fetch(`${API_URL}/${userId}`, {
        method: "GET",
        headers: {
          "x-api-key": API_KEY || "",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des infos utilisateur:",
        error
      );
      return null;
    }
  };

  const fetchUserSnaps = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        throw new Error("Utilisateur non authentifié.");
      }

      const response = await fetch(`${API_URL_SNAP}`, {
        method: "GET",
        headers: {
          "x-api-key": API_KEY || "",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `Erreur API: ${response.status} - ${
            data.message || "Problème inconnu"
          }`
        );
      }

      console.log("Snaps reçus :", JSON.stringify(data, null, 2));
      const snapsData = (data.data || []) as Snap[];
      setSnaps(snapsData);

      const userIds = [...new Set(snapsData.map((snap) => snap.from))];
      const usersData: { [key: string]: User } = {};

      for (const userId of userIds) {
        const userInfo = await fetchUserInfo(userId);
        if (userInfo) {
          usersData[userId] = userInfo;
        }
      }

      setUsers(usersData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur de récupération des snaps"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const markSnapAsSeen = async (snapId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        throw new Error("Utilisateur non authentifié.");
      }

      console.log("Marquage du snap comme vu:", snapId);
      const response = await fetch(`${API_URL_SNAP}/seen/${snapId}`, {
        method: "PUT",
        headers: {
          "x-api-key": API_KEY || "",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();

      if (responseData.data === "Snap already seen.") {
        console.log("Snap déjà vu, suppression de la liste");
        setSnaps(snaps.filter((snap) => snap._id !== snapId));
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      setSnaps(snaps.filter((snap) => snap._id !== snapId));
      console.log("Snap marqué comme vu et supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors du marquage du snap comme vu:", error);

      if (!(error instanceof Error && error.message.includes("already seen"))) {
        setError(
          error instanceof Error
            ? error.message
            : "Erreur lors du marquage du snap comme vu"
        );
      }
    }
  };

  const fetchSnapDetails = async (snapId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        throw new Error("Utilisateur non authentifié.");
      }

      const response = await fetch(`${API_URL_SNAP}/${snapId}`, {
        method: "GET",
        headers: {
          "x-api-key": API_KEY || "",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `Erreur API: ${response.status} - ${
            data.message || "Problème inconnu"
          }`
        );
      }

      console.log(`Détails du snap ${snapId} :`, JSON.stringify(data, null, 2));
      setSnapDetails(data.data);
      setViewingSnapId(snapId);
      setModalVisible(true);

      if (data.data.duration) {
        console.log(`Démarrage du timer pour ${data.data.duration} secondes`);
        setRemainingTime(data.data.duration);

        const timer = setInterval(() => {
          setRemainingTime((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              console.log("Timer terminé, marquage du snap comme vu");
              setModalVisible(false);
              markSnapAsSeen(snapId);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du snap :", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération du snap"
      );
    }
  };

  useEffect(() => {
    fetchUserSnaps();
  }, [fetchUserSnaps]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FD3E83" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Snaps reçus</Text>
        <TouchableOpacity style={styles.headerButton} onPress={fetchUserSnaps}>
          <Text style={styles.headerButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={snaps}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.snapItem}
                onPress={() => fetchSnapDetails(item._id)}
              >
                {users[item.from]?.profilePicture ? (
                  <Image
                    source={{ uri: users[item.from].profilePicture }}
                    style={styles.snapIcon}
                  />
                ) : (
                  <View style={styles.snapIcon}>
                    <Text style={styles.snapIconText}>
                      {users[item.from]?.username?.charAt(0).toUpperCase() ||
                        "?"}
                    </Text>
                  </View>
                )}
                <View style={styles.snapContent}>
                  <Text style={styles.snapText}>
                    Snap de{" "}
                    {users[item.from]?.username || "Utilisateur inconnu"}
                  </Text>
                  <View style={styles.snapInfo}>
                    <Text style={styles.snapDate}>
                      {new Date(item.date).toLocaleString()}
                    </Text>
                    {item.duration && (
                      <Text style={styles.snapDuration}>{item.duration}s</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <SafeAreaView style={styles.modalContainer}>
          {remainingTime > 0 && (
            <View style={styles.timerContainer}>
              <View style={styles.timerBackground}>
                <Text style={styles.timerText}>{remainingTime}s</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setModalVisible(false);
              if (viewingSnapId) {
                markSnapAsSeen(viewingSnapId);
              }
            }}
          >
            <Text style={styles.closeText}>✖</Text>
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            {snapDetails && snapDetails.image ? (
              <Image
                source={{
                  uri: snapDetails.image.startsWith("data:")
                    ? snapDetails.image
                    : `data:image/jpeg;base64,${snapDetails.image}`,
                }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.noImageText}>Aucune image disponible.</Text>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}