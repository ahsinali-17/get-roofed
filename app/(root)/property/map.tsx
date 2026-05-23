import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    Linking,
    Platform,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { WebView } from "react-native-webview";

export default function MapScreen() {
  const {
    latitude,
    longitude,
    title,
    address,
  }: {
    latitude: string;
    longitude: string;
    title: string;
    address: string;
  } = useLocalSearchParams();

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <View className="overflow-hidden flex-row justify-between items-center px-4 py-3 border-b-2 border-gray-200 bg-yellow-50">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className="rounded-full p-2 bg-blue-100"
            style={{ elevation: 2 }}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={16} color="#000" />
          </TouchableOpacity>
          <View className="flex-col items-start">
            <Text className="font-bold text-sm">{title}</Text>
            <Text className="text-gray-400 text-sm text-semibold">
              {address}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center gap-1 rounded-full p-2 bg-blue-100"
          style={{ elevation: 2 }}
          onPress={() => {
            Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
            );
          }}
        >
          <FontAwesome name="send" size={12} color="#000" />
          <Text className="flex-1 text-sm font-semibold text-gray-600 ml-1">
            Google Maps
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        {Platform.OS === "web" ? (
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${(lng || 0) - 0.03}%2C${(lat || 0) - 0.03}%2C${(lng || 0) + 0.03}%2C${(lat || 0) + 0.03}&layer=mapnik&marker=${lat}%2C${lng}`}
            style={{
              border: "none",
              flex: 1,
            }}
          />
        ) : (
          <WebView
            source={{
              uri: `https://www.openstreetmap.org/export/embed.html?bbox=${(lng || 0) - 0.03}%2C${(lat || 0) - 0.03}%2C${(lng || 0) + 0.03}%2C${(lat || 0) + 0.03}&layer=mapnik&marker=${lat}%2C${lng}`,
            }}
            scrollEnabled={false}
            style={{ flex: 1 }}
            pointerEvents="none"
          />
        )}
      </View>
    </View>
  );
}
