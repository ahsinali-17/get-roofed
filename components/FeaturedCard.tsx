import { formatPrice } from "@/lib/utils";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Property } from "../types";

const FeaturedCard = ({ property }: { property: Property }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push(`/(root)/(tabs)`)}
      className="w-64 relative mr-2 mb-2 rounded-2xl overflow-hidden bg-white"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 22,
        elevation: 4,
        opacity: property.is_sold ? 0.5 : 1,
      }}
    >
      <Image
        source={
          property.images.length > 0
            ? { uri: property.images[0] }
            : require("../assets/images/icon.png")
        }
        className="w-full h-44"
        resizeMode="cover"
      />

      {property.is_sold && (
        <View className="absolute top-3 right-3 bg-red-500 rounded-2xl px-2 py-1">
          <Text className="text-white font-semibold text-sm">Sold</Text>
        </View>
      )}

      <View className="absolute top-3 left-3 bg-yellow-400 rounded-2xl px-2 py-1">
        <Text className="text-black font-semibold text-sm">
          {property.type}
        </Text>
      </View>

      <View className="p-2 space-y-2">
        <View className="flex items-start justify-center ">
          <Text className="font-bold text-lg text-black leading-5">
            {property.title}
          </Text>
          <View className="flex-row items-center justify-start gap-2">
            <FontAwesome name="map-marker" size={14} color="gray" />
            <Text className="text-gray-500 font-normal text-sm">
              {property.address}, {property.city}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center justify-start gap-2">
            <FontAwesome name="money" size={14} color="#1e40af" />
            <Text className="text-blue-800 font-bold text-sm">
              {formatPrice(property.price)}
            </Text>
          </View>

          <View className="flex-row items-center justify-end gap-3">
            <View className="flex-row items-center justify-start gap-2">
              <FontAwesome name="bed" size={14} color="gray" />
              <Text className="text-gray-500 font-normal text-sm">
                {property.bedrooms}
              </Text>
            </View>
            <View className="flex-row items-center justify-start gap-2">
              <FontAwesome name="shower" size={14} color="gray" />
              <Text className="text-gray-500 font-normal text-sm">
                {property.bathrooms}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FeaturedCard;
