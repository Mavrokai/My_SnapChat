import { Text, View ,Platform } from "react-native";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
export default function Index() {
  return (
    <View>
    <ThemedView>
      <ThemedText type="subtitle">jojo</ThemedText>
      </ThemedView>
    
    </View>
  );
}
