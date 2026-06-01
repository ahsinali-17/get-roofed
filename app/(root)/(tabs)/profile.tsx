import { useAuth, useUser } from "@clerk/expo";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenContainer } from "react-native-screens";

export default function Profile() {
  const { signOut } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [updatingImage, setUpdatingImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleProfilePicUpdate = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to update your profile picture.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      setUpdatingImage(true);

      const base64Image = result.assets[0].base64;
      const uri = result.assets[0].uri;
      const filename = uri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      await user?.setProfileImage({ file: dataUrl });

      Alert.alert("Success", "Profile picture updated successfully!");
      user?.reload();
    } catch (error) {
      console.error("Error updating profile image:", error);
      Alert.alert(
        "Error",
        "Failed to update profile picture. Please try again.",
      );
    } finally {
      setUpdatingImage(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </ScreenContainer>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 py-4 px-5">
        <Text className="font-bold text-xl text-black mb-1">Profile</Text>

        <View className="mx-auto relative w-36 h-36 rounded-full ">
          {user.imageUrl && !imageError ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={{ width: 144, height: 144, borderRadius: 72 }}
              contentFit="cover"
              contentPosition="top"
              onLoad={() => {
                console.log("Image loaded successfully!");
              }}
              onError={(error) => {
                console.log("Image failed to load. Error:", error);
                console.log("Image URL:", user.imageUrl);
                setImageError(true);
              }}
            />
          ) : (
            <View className="w-full h-full rounded-full bg-blue-300 justify-center items-center">
              <FontAwesome name="user" size={48} color="#fff" />
            </View>
          )}
          <TouchableOpacity
            className="absolute -bottom-2 -right-2 z-10 bg-blue-100 rounded-full p-2"
            onPress={handleProfilePicUpdate}
            disabled={updatingImage}
          >
            {updatingImage ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <FontAwesome name="pencil" size={16} color="#000" />
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-8 gap-4 items-center shadow-sm shadow-gray-300 bg-gray-100 w-3/4 mx-auto py-6">
          <Field
            label="Saved Properties"
            icon="home"
            onPress={() => {
              router.push("/(root)/(tabs)/saved");
            }}
          />
          <Field
            label="Notifications"
            icon="bell"
            onPress={() => {
              Alert.alert("Settings: Coming soon");
            }}
          />
          <Field
            label="Settings"
            icon="gear"
            onPress={() => {
              Alert.alert("Settings: Coming soon");
            }}
          />
          <Field
            label="Help & support"
            icon="question-circle"
            onPress={() => {
              Linking.openURL("mailto:kribbsupport@gmail.com");
            }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSignOut}
          className="mt-auto items-center bg-red-400  p-3 rounded-lg w-3/4 self-center active:bg-red-500 active:scale-105"
        >
          <Text className="font-bold text-xl text-white">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const Field = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-full flex-row justify-between items-center gap-3 py-3 px-4 bg-gray-200 rounded-lg active:scale-105 active:bg-gray-300"
    >
      {icon && <FontAwesome name={icon} size={20} color="#6B7280" />}
      <Text className="text-gray-900 text-lg">{label}</Text>
      <FontAwesome
        name="chevron-right"
        size={16}
        color="#6B7280"
        className="ml-auto"
      />
    </TouchableOpacity>
  );
};
