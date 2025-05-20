import * as ImageManipulator from "expo-image-manipulator";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
const API_URL_SNAP = process.env.EXPO_PUBLIC_API_URLSNAP;

interface Contact {
  _id: string;
  username: string;
  profilePicture: string;
}

export default function SelectRecipient() {
  const { imageUri } = useLocalSearchParams();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bearerToken, setBearerToken] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(5);

  const durationOptions = [
    { label: "5s", value: 5 },
    { label: "15s", value: 15 },
    { label: "30s", value: 30 },
    { label: "1min", value: 60 },
  ];

  const authenticate = async () => {
    try {
      console.log("Tentative d'authentification...");
      console.log("URL:", `${API_URL}`);
      console.log("Headers:", {
        "x-api-key": API_KEY ? "présent" : "manquant",
        "Content-Type": "application/json",
      });

      const response = await fetch(`${API_URL}`, {
        method: "PUT",
        headers: {
          "x-api-key": API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "bryan2@gmail.com",
          password: "bryan",
        }),
      });

      console.log("Status de la réponse:", response.status);
      const responseText = await response.text();
      console.log("Réponse brute:", responseText);

      if (!response.ok) {
        throw new Error(
          `Erreur d'authentification: ${response.status} ${responseText}`
        );
      }

      const data = JSON.parse(responseText);
      console.log("Token reçu:", data.data.token ? "présent" : "manquant");
      return data.data.token;
    } catch (err) {
      console.error("Erreur détaillée:", err);
      throw err;
    }
  };

  const authenticateAndFetchContacts = useCallback(async () => {
    try {
      const token = await authenticate();
      setBearerToken(token);
      await fetchContacts(token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur d'authentification"
      );
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    authenticateAndFetchContacts();
  }, [authenticateAndFetchContacts]);

  const fetchContacts = async (token: string) => {
    try {
      console.log("Tentative de récupération des contacts...");
      console.log("Token:", token ? "présent" : "manquant");

      const response = await fetch(`${API_URL}`, {
        method: "GET",
        headers: {
          "x-api-key": API_KEY || "",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Status de la réponse contacts:", response.status);
      const responseText = await response.text();
      console.log("Réponse brute contacts:", responseText);

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération des contacts: ${response.status} ${responseText}`
        );
      }

      const data = JSON.parse(responseText);
      console.log("Données reçues:", data);
      const contactsList = data.data || [];
      setContacts(contactsList);
      setFilteredContacts(contactsList);
    } catch (err) {
      console.error("Erreur détaillée contacts:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = contacts.filter((contact) =>
      contact.username.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredContacts(filtered);
  };

  const handleSend = async (recipientId: string) => {
    if (!bearerToken) {
      setError("Non authentifié");
      return;
    }

    try {
      setLoading(true);

      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri as string,
        [{ resize: { width: 360, height: 640 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const response = await fetch(manipResult.uri);
      const blob = await response.blob();
      const reader = new FileReader();

      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          if (!base64 || base64.length < 100) {
            reject(new Error("L'image est vide ou trop petite"));
            return;
          }
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const base64Image = await base64Promise;

      if (
        !base64Image.startsWith("data:image/jpeg;base64,") &&
        !base64Image.startsWith("data:image/png;base64,")
      ) {
        throw new Error("Format d'image non supporté. Utilisez PNG ou JPEG.");
      }

      console.log("Taille de l'image en base64:", base64Image.length);
      console.log("URL de l'API pour l'envoi:", API_URL_SNAP);
      console.log("Présence de la clé API:", API_KEY ? "Oui" : "Non");

      const sendResponse = await fetch(`${API_URL_SNAP}`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY || "",
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: recipientId,
          image: base64Image,
          duration: selectedDuration,
        }),
      });

      const responseText = await sendResponse.text();
      console.log("Réponse de l'envoi:", responseText);

      if (!sendResponse.ok) {
        throw new Error(
          `Erreur lors de l'envoi du message: ${sendResponse.status} ${responseText}`
        );
      }

      const responseData = JSON.parse(responseText);
      if (responseData && responseData.success === true) {
        console.log("Snap envoyé avec succès!");

        // Attendre un court instant pour que les données soient mises à jour
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Récupérer les snaps
        const snapResponse = await fetch(`${API_URL_SNAP}`, {
          method: "GET",
          headers: {
            "x-api-key": API_KEY || "",
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
          },
        });

        const snapData = await snapResponse.json();
        console.log("Données des snaps:", JSON.stringify(snapData, null, 2));

        if (snapData && snapData.data && snapData.data.length > 0) {
          const lastSnap = snapData.data[0];
          console.log("ID du dernier snap:", lastSnap._id);
          console.log("Détails du dernier snap:", lastSnap);

          // Récupérer les détails spécifiques du snap
          const snapDetailsResponse = await fetch(
            `${API_URL_SNAP}/${lastSnap._id}`,
            {
              method: "GET",
              headers: {
                "x-api-key": API_KEY || "",
                Authorization: `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          const snapDetails = await snapDetailsResponse.json();
          console.log(
            "Détails complets du snap:",
            JSON.stringify(snapDetails, null, 2)
          );
        }

        setError(null);
        setTimeout(() => router.back(), 2000);
      } else {
        throw new Error("Réponse invalide du serveur");
      }
    } catch (err) {
      console.error("Erreur détaillée envoi:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

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
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri as string }} style={styles.image} />
      </View>

      <View style={styles.contactsContainer}>
        <Text style={styles.title}>Sélectionner un destinataire</Text>

        <View style={styles.durationContainer}>
          <Text style={styles.durationTitle}>Durée du snap:</Text>
          <View style={styles.durationOptions}>
            {durationOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.durationButton,
                  selectedDuration === option.value && styles.selectedDuration,
                ]}
                onPress={() => setSelectedDuration(option.value)}
              >
                <Text
                  style={[
                    styles.durationText,
                    selectedDuration === option.value &&
                      styles.selectedDurationText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un contact..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleSend(item._id)}
            >
              <Text style={styles.avatar}>{item.profilePicture}</Text>
              <Text style={styles.contactName}>{item.username}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    height: "40%",
    width: "100%",
    padding: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  contactsContainer: {
    flex: 1,
    padding: 20,
    width: "100%",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    marginBottom: 10,
  },
  avatar: {
    fontSize: 30,
    marginRight: 15,
  },
  contactName: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "#FD3E83",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  searchInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    color: "#fff",
    fontSize: 16,
  },
  durationContainer: {
    marginBottom: 20,
  },
  durationTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  durationOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  durationButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  selectedDuration: {
    backgroundColor: "#FD3E83",
  },
  durationText: {
    color: "#fff",
    fontSize: 14,
  },
  selectedDurationText: {
    fontWeight: "bold",
  },
});
