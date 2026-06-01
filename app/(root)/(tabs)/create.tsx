import { useSupabase } from "@/hooks/useSupabase";
import { useUserStore } from "@/store/useUserStore";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TYPES = ["villa", "apartment", "house", "studio"];
type PropertyType = (typeof TYPES)[number];

const MIN_PRICE = 1;
const MAX_PRICE = 999_999_999;

const inputStyles =
  "bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-800";
const labelStyles = "text-gray-800 font-semibold mb-2";
const sectionStyles = "mb-5";

interface FormState {
  title: string;
  description: string;
  price: number | string;
  type: PropertyType;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  address: string;
  city: string;
  isFeatured: boolean;
  localImages: string[];
  uploadedImages: string[];
}

const initialState: FormState = {
  title: "",
  description: "",
  price: 0,
  type: "house",
  latitude: 0,
  longitude: 0,
  bedrooms: 0,
  bathrooms: 0,
  areaSqft: 0,
  address: "",
  city: "",
  isFeatured: false,
  localImages: [],
  uploadedImages: [],
};

export default function Create() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const authSupabase = useSupabase();
  const { isAdmin } = useUserStore();

  //loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const formUpdate = (fields: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const addImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
      selectionLimit: 6,
    });

    if (result.canceled) return;

    setIsUploading(true);

    const uploadedUrls: string[] = [];
    const previewUris: string[] = [];

    for (const asset of result.assets) {
      try {
        const filename = `property_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.jpg`;

        const base64 = asset.base64!;
        const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

        const { error } = await authSupabase.storage
          .from("property_images")
          .upload(filename, buffer, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (error) throw error;

        const { data: urlData } = authSupabase.storage
          .from("property_images")
          .getPublicUrl(filename);

        uploadedUrls.push(urlData.publicUrl);
        previewUris.push(asset.uri);
      } catch (err) {
        console.error("Upload error:", err);
        Alert.alert("Upload Failed", "One or more images failed to upload.");
      }
    }

    formUpdate({
      uploadedImages: [...form.uploadedImages, ...uploadedUrls],
      localImages: [...form.localImages, ...previewUris],
    });
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    formUpdate({
      localImages: form.localImages.filter((_, i) => i !== index),
      uploadedImages: form.uploadedImages.filter((_, i) => i !== index),
    });
  };

  const handleLocationDetection = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission to access location is required!");
      return;
    }
    try {
      setIsGettingLocation(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      formUpdate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Error occurred while getting location:", error);
      Alert.alert(
        "Error",
        "An error occured; Enter location manually or try again.",
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.description ||
      !form.bedrooms ||
      !form.bathrooms ||
      !form.areaSqft ||
      !form.city ||
      !form.address ||
      !form.latitude ||
      !form.longitude ||
      form.localImages.length === 0
    ) {
      Alert.alert(
        "Error",
        "Please fill in all required fields and add at least one image.",
      );
      return;
    }
    if (Number(form.price) < MIN_PRICE || Number(form.price) > MAX_PRICE) {
      Alert.alert(
        "Error",
        `Price must be between PKR ${MIN_PRICE} and PKR ${MAX_PRICE.toLocaleString("en-PK")}.`,
      );
      return;
    }
    setIsSubmitting(true);
    const { error } = await authSupabase.from("properties").insert({
      title: form.title,
      description: form.description,
      price: Number(form.price),
      type: form.type,
      latitude: form.latitude,
      longitude: form.longitude,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      area_sqft: form.areaSqft,
      address: form.address,
      city: form.city,
      is_featured: form.isFeatured,
      images: form.uploadedImages,
      is_sold: false,
    });
    setIsSubmitting(false);
    if (error) {
      Alert.alert(
        "Error",
        "An error occurred while submitting the listing. Please try again.",
      );
      console.error("Error inserting property:", error);
      return;
    }
    setForm(initialState);
    Alert.alert("Success", "Property listing created successfully!", [
      { text: "OK", onPress: () => router.push("/(root)/(tabs)") },
    ]);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 p-4"
      >
        <Text className="font-bold text-xl text-black mb-1">Add Property</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        >
          <View className={`${sectionStyles}`}>
            <Text className={labelStyles}>Photos (up to 6)</Text>
            <View className=" w-full relative flex-row flex-wrap gap-2">
              {form.localImages.length > 0 &&
                form.localImages.map((uri, index) => {
                  return (
                    <View className="flex-row relative" key={index}>
                      <Image
                        key={index}
                        source={{ uri: uri }}
                        className="w-24 h-24 rounded-2xl border border-gray-300"
                        resizeMode="cover"
                      />
                      {index === 0 && (
                        <View className="absolute top-0 left-0 px-2 py-1 bg-red-500 bg-opacity-50 flex items-center justify-center rounded-2xl">
                          <Text className="text-white font-semibold text-sm">
                            Cover
                          </Text>
                        </View>
                      )}

                      <TouchableOpacity
                        onPress={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-400 rounded-full p-1"
                      >
                        <FontAwesome name="close" size={12} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  );
                })}

              {form.localImages.length < 6 && (
                <TouchableOpacity
                  onPress={addImage}
                  disabled={isUploading}
                  className="bg-white rounded-2xl p-3 border-2 border-dashed border-gray-300 items-center justify-center gap-2 w-24 h-24"
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#888" />
                  ) : (
                    <FontAwesome name="plus" size={24} color="#888" />
                  )}
                  <Text className="text-gray-500 font-semibold text-sm">
                    Add
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View className={sectionStyles}>
            <Text className={labelStyles}>Title</Text>
            <TextInput
              value={form.title}
              onChangeText={(text) => formUpdate({ title: text })}
              placeholder="Beautiful 3-bedroom house"
              placeholderTextColor={"#888"}
              className={inputStyles}
            />
          </View>

          <View className={sectionStyles}>
            <Text className={labelStyles}>Description</Text>
            <TextInput
              value={form.description}
              onChangeText={(text) => formUpdate({ description: text })}
              placeholder="Enter property description"
              placeholderTextColor={"#888"}
              className={inputStyles}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View className={sectionStyles}>
            <Text className={labelStyles}>Price (PKR)</Text>
            <TextInput
              value={form.price as string}
              onChangeText={(value) =>
                formUpdate({
                  price: Number.parseInt(value, 10) as unknown as number,
                })
              }
              placeholder="Enter property price PKR 1 - PKR 999,999,999"
              placeholderTextColor="#888"
              keyboardType="numeric"
              className={inputStyles}
            />
            <Text className="text-xs text-gray-500 mt-1">
              Price must be between {MIN_PRICE} and{" "}
              {MAX_PRICE.toLocaleString("en-PK")}.
            </Text>
          </View>

          <View className={sectionStyles}>
            <Text className={labelStyles}>Property Type</Text>
            <View className="flex-row gap-2">
              {TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => formUpdate({ type })}
                  className={`p-2 bg-${form.type === type ? "blue-500" : "white"} rounded-2xl mb-2`}
                >
                  <Text className="text-gray-800 font-semibold">{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View
            className={`${sectionStyles} flex-row items-center justify-between`}
          >
            <Counter
              value={form.bedrooms}
              label="Bedrooms"
              onChange={(value) => formUpdate({ bedrooms: value as number })}
            />
            <Counter
              value={form.bathrooms}
              label="Bathrooms"
              onChange={(value) => formUpdate({ bathrooms: value as number })}
            />
          </View>

          <View className={sectionStyles}>
            <Text className={labelStyles}>Area (sq ft)</Text>
            <TextInput
              value={String(form.areaSqft)}
              onChangeText={(text) => formUpdate({ areaSqft: Number(text) })}
              placeholder="Enter property area in square feet"
              placeholderTextColor="#888"
              className={inputStyles}
              keyboardType="numeric"
            />
          </View>

          <View className={sectionStyles}>
            <Text className={labelStyles}>Address</Text>
            <TextInput
              value={form.address}
              onChangeText={(text) => formUpdate({ address: text })}
              placeholder="Enter Street address"
              placeholderTextColor="#888"
              className={inputStyles}
            />
          </View>

          <View className={sectionStyles}>
            <Text className={labelStyles}>City</Text>
            <TextInput
              value={form.city}
              onChangeText={(text) => formUpdate({ city: text })}
              placeholder="Enter city name e.g. Islamabad"
              placeholderTextColor="#888"
              className={inputStyles}
            />
          </View>

          <View className={sectionStyles}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className={labelStyles}>Coordinates</Text>
              <TouchableOpacity
                onPress={handleLocationDetection}
                disabled={isGettingLocation}
                className="bg-blue-500 px-3 py-1 rounded-2xl flex-row gap-1"
              >
                {isGettingLocation ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <FontAwesome name="map-marker" size={16} color="#fff" />
                )}
                <Text className="text-white font-semibold text-sm ml-1">
                  Detect
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-4">
              <TextInput
                value={String(form.latitude)}
                onChangeText={(text) => formUpdate({ latitude: Number(text) })}
                placeholder="Latitude"
                placeholderTextColor="#888"
                className={`${inputStyles} flex-1`}
                keyboardType="numeric"
              />
              <TextInput
                value={String(form.longitude)}
                onChangeText={(text) => formUpdate({ longitude: Number(text) })}
                placeholder="Longitude"
                placeholderTextColor="#888"
                className={`${inputStyles} flex-1`}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View className="mb-10 border-2 border-gray-300 rounded-2xl">
            <TouchableOpacity
              onPress={() => formUpdate({ isFeatured: !form.isFeatured })}
              className={`flex-row items-center justify-between p-4 bg-${form.isFeatured ? "yellow-100" : "white"}`}
            >
              <View className="w-3/4">
                <Text className="text-gray-800 font-semibold">
                  Feature this listing
                </Text>
                <Text className="text-gray-500 text-sm">
                  Featured listings appear at the top and attract more
                  attention.
                </Text>
              </View>
              <FontAwesome
                name={form.isFeatured ? "star" : "star-o"}
                size={24}
                color={form.isFeatured ? "#f59e0b" : "#888"}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || isUploading || isGettingLocation}
            className="bg-blue-500 py-3 rounded-2xl items-center justify-center mb-10 flex-1"
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
              opacity:
                isSubmitting || isUploading || isGettingLocation ? 0.7 : 1,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Submit Listing</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const Counter = ({
  value,
  label,
  onChange,
}: {
  value: number;
  label: string;
  onChange: (value: number) => void;
}) => {
  return (
    <View className="">
      <Text className={labelStyles}>{label}</Text>
      <View className="flex-row items-center gap-4">
        <TouchableOpacity onPress={() => onChange(Math.max(0, value - 1))}>
          <FontAwesome name="minus" size={16} color="#888" />
        </TouchableOpacity>
        <Text className="text-gray-800 font-semibold">{value}</Text>
        <TouchableOpacity onPress={() => onChange(value + 1)}>
          <FontAwesome name="plus" size={16} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
