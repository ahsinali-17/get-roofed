import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SignIN() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center gap-5">
      <Text className="font-bold text-lg">SignIN</Text>
      <TouchableOpacity
        onPress={() => router.push("/(auth)/sign-up")}
        className="bg-black px-5 py-3 rounded-lg"
      >
        <Text className="text-white text-bold text-xl text-center">
          Sign up
        </Text>
      </TouchableOpacity>
    </View>
  );
}
