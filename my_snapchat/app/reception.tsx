import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Image, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL_SNAP = process.env.EXPO_PUBLIC_API_URLSNAP;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export default function Reception() {
  const [snaps, setSnaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapDetails, setSnapDetails] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 🔹 Récupérer la liste des snaps reçus
  const fetchUserSnaps = async () => {
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
        throw new Error(`Erreur API: ${response.status} - ${data.message || "Problème inconnu"}`);
      }

      console.log("Snaps reçus :", JSON.stringify(data, null, 2));
      setSnaps(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de récupération des snaps");
    } finally {
      setLoading(false);
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
        throw new Error(`Erreur API: ${response.status} - ${data.message || "Problème inconnu"}`);
      }

      console.log(`Détails du snap ${snapId} :`, JSON.stringify(data, null, 2));
      setSnapDetails(data);
      setModalVisible(true);
    } catch (error) {
      console.error("Erreur lors de la récupération du snap :", error);
    }
  };

  useEffect(() => {
    fetchUserSnaps();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FD3E83" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Snaps reçus</Text>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={snaps}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.snapItem} onPress={() => fetchSnapDetails(item._id)}>
              <Text style={styles.snapText}>📷 Snap de {item.from} - {new Date(item.date).toLocaleString()}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>✖ Fermer</Text>
          </TouchableOpacity>

          {snapDetails && snapDetails.image ? (
            <Image source={{ uri: snapDetails.image }} style={styles.image} />
          ) : (
            <Text>Aucune image disponible.</Text>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 10 },
  errorText: { color: "red", fontSize: 16, marginBottom: 10 },
  snapItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  snapText: { fontSize: 18, color: "#555" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.8)" },
  closeButton: { position: "absolute", top: 40, right: 20, padding: 10 },
  closeText: { fontSize: 20, color: "white" },
  image: { width: 300, height: 500, marginTop: 20 },
});
