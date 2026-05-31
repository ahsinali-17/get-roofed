import { useAuth, useUser } from "@clerk/expo";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
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
      if (Platform.OS === "web") {
        setUpdatingImage(true);
        const input = document.createElement("input") as HTMLInputElement;
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
          try {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file && user) {
              await user.setProfileImage({ file });
              await user.reload();
              alert("Profile picture updated successfully!");
            }
          } catch (error) {
            console.error("Error updating profile picture:", error);
            alert("Failed to update profile picture");
          } finally {
            setUpdatingImage(false);
          }
        };
        input.click();
      }
      //else{
      // setUpdatingImage(true);
      // const permissonResult =
      //   await ImagePicker.requestMediaLibraryPermissionsAsync();
      // if (permissonResult.granted === false) {
      //   Alert.alert("Permission to access media library is required!");
      //   setUpdatingImage(false);
      //   return;
      // }
      // const pickerResult = await ImagePicker.launchImageLibraryAsync({
      //   mediaTypes: "images",
      //   allowsEditing: true,
      //   aspect: [1, 1],
      //   quality: 0.75,
      //   base64: true,
      // });
      // if (pickerResult.canceled) {
      //   setUpdatingImage(false);
      //   return;
      // }
      // const selectedImage = pickerResult.assets[0].uri;
      // const filename = selectedImage.split("/").pop() || "profile-pic.jpg";
      // const response = await fetch(selectedImage);
      // const blob = await response.blob();
      // const file = new File([blob], filename, { type: "image/jpeg" });
      // await user?.setProfileImage({ file });
      // user?.reload();
      //    Alert.alert("Profile picture updated successfully!");
      //setUpdatingImage(false);
      //}
    } catch (error) {
      console.error("Error updating profile picture:", error);
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

        <View className="mx-auto relative w-24 h-24 rounded-full ">
          <Image
            source={{ uri: user.imageUrl }}
            className="w-full h-full rounded-full"
            contentFit="cover"
            contentPosition={"top"}
          />
          <TouchableOpacity
            className="absolute bottom-0 right-0 z-10 bg-blue-100 rounded-full p-2"
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
