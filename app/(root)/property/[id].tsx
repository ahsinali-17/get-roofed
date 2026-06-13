import { useSaveProperty } from "@/hooks/useSaveProperty";
import { useSupabase } from "@/hooks/useSupabase";
import { supabase } from "@/lib/Supabase";
import { formatPrice } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import { Property } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
//import ImageViewer from "react-native-image-viewing";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function PropertyDetails() {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const { isAdmin } = useUserStore();
  const authSupabase = useSupabase();

  const { id }: { id: string } = useLocalSearchParams();
  const { isSaved, saveLoading, toggleSave } = useSaveProperty({
    propertyID: id,
  });

  const router = useRouter();
  const width = Dimensions.get("window").width;
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    let index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveImageIndex(index);
  };

  const getDesc = () => {
    let isLong =
      property?.description.length && property.description.length > 100;
    if (isDescExpanded || !isLong) return property?.description;

    return property?.description.slice(0, 100) + "...";
  };

  const handleContact = () => {
    const message = `Hello, I'm interested in the property "${property?.title}" located at ${property?.address}. Could you please provide more details?`;
    const phoneNumber = process.env.EXPO_PUBLIC_PHONENUMBER || "+1234567890";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const handleSold = async () => {
    if (!property) return;
    let query;
    if (!property.is_sold) {
      query = authSupabase
        .from("properties")
        .update({ is_sold: true })
        .eq("id", id);
    } else {
      query = authSupabase
        .from("properties")
        .update({ is_sold: false })
        .eq("id", id);
    }
    const { error } = await query;
    if (error) {
      alert("Error marking property as sold: " + error.message);
    } else {
      if (property.is_sold) {
        alert("Property marked as available!");
      } else {
        alert("Property marked as sold!");
      }
      fetchProperty();
    }
  };

  const handleDelete = async () => {
    if (!property) return;
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this property?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteProperty();
          },
        },
      ],
    );
  };

  const deleteProperty = async () => {
    const { error } = await authSupabase
      .from("properties")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error deleting property: " + error.message);
    } else {
      alert("Property deleted!");
      router.back();
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching property:", error);
    } else {
      setProperty(data);
    }
    setLoading(false);
  };

  if (!loading && !property) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Property not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="flex-1 bg-white relative"
        showsHorizontalScrollIndicator={false}
      >
        <FlatList
          data={property ? property.images : []}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          style={property?.is_sold ? { opacity: 0.5 } : { opacity: 1 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ width, height: 200 }}
              className="mb-4"
              onPress={() => setImageViewerVisible(true)}
            >
              <Image
                source={{ uri: item }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />

              <View className="absolute bottom-2 right-2 bg-black opacity-75 rounded-full px-3 py-1 flex-row justify-center items-center">
                <Text className="text-sm text-white font-semibold">
                  {activeImageIndex + 1} / {property?.images.length}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
        <View className="px-4 absolute top-2 left-0 right-0 flex-row justify-between items-center">
          <TouchableOpacity
            className="p-2 bg-gray-100 rounded-full"
            onPress={() => router.back()}
            style={{
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            <FontAwesome name="arrow-left" size={16} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            className="p-2 bg-gray-100 rounded-full"
            onPress={() => toggleSave()}
            disabled={saveLoading}
            style={{
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            <FontAwesome
              name={isSaved ? "heart" : "heart-o"}
              size={16}
              color="#dc0f0f"
            />
          </TouchableOpacity>
        </View>

        <View
          className="px-4 pb-4 mb-2"
          style={property?.is_sold ? { opacity: 0.75 } : { opacity: 1 }}
        >
          <View className="flex-row items-center justify-start gap-3">
            <View
              className="flex-row items-center mb-2 rounded-xl bg-gray-100 px-2 py-1 self-start"
              style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              }}
            >
              <Text className="text-sm font-bold text-blue-600">
                {property?.type}
              </Text>
            </View>

            {property?.is_sold && (
              <View
                className="flex-row items-center mb-2 rounded-xl bg-red-500 px-2 py-1 self-start"
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                }}
              >
                <Text className="text-sm font-bold text-white">Sold</Text>
              </View>
            )}
          </View>

          <Text className="text-xl font-bold">${property?.title}</Text>
          <Text className="text-blue-600 font-bold text-lg mt-1">
            {" "}
            {formatPrice(property?.price || 0)}
          </Text>

          <View className="flex-row flex-wrap items-center justify-between bg-gray-50 rounded-2xl py-4">
            <Card label="Beds" icon="bed" value={property?.bedrooms || 0} />
            <Card label="Baths" icon="bath" value={property?.bathrooms || 0} />
            <Card
              label="Area"
              icon="area-chart"
              value={property?.area_sqft || 0}
            />
            <Card label="Type" icon="building" value={property?.type || 0} />
          </View>

          <Text className="text-lg font-bold mb-2">Description</Text>
          <Text className="text-gray-600">{getDesc()}</Text>
          <TouchableOpacity onPress={() => setIsDescExpanded((prev) => !prev)}>
            <Text className="text-blue-600 font-bold">
              {isDescExpanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>

          <Text className="text-lg font-bold mt-4 mb-2">Location</Text>
          <View className="flex-row gap-1 items-center">
            <FontAwesome name="map-marker" size={16} color="#6a6969" />
            <Text className="text-gray-600 text-sm text-semibold">
              {property?.address}, {property?.city}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/(root)/property/map",
                params: {
                  latitude: property?.latitude,
                  longitude: property?.longitude,
                  title: property?.title,
                  address: property?.address,
                },
              });
            }}
            activeOpacity={0.9}
            style={{ width: "100%", height: 200 }}
            className="mt-4 rounded-lg overflow-hidden"
          >
            {Platform.OS === "web" ? (
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(property?.longitude || 0) - 0.03}%2C${(property?.latitude || 0) - 0.03}%2C${(property?.longitude || 0) + 0.03}%2C${(property?.latitude || 0) + 0.03}&layer=mapnik&marker=${property?.latitude}%2C${property?.longitude}`}
                style={{
                  border: "none",
                  borderRadius: 25,
                  flex: 1,
                  pointerEvents: "none",
                }}
              />
            ) : (
              <WebView
                source={{
                  uri: `https://www.openstreetmap.org/export/embed.html?bbox=${(property?.longitude || 0) - 0.03}%2C${(property?.latitude || 0) - 0.03}%2C${(property?.longitude || 0) + 0.03}%2C${(property?.latitude || 0) + 0.03}&layer=mapnik&marker=${property?.latitude}%2C${property?.longitude}`,
                }}
                scrollEnabled={false}
                style={{ flex: 1 }}
                pointerEvents="none"
              />
            )}
            <View className="absolute bottom-2 right-2 bg-black opacity-75 rounded-full px-3 py-1 flex-row justify-center items-center">
              <Text className="text-sm text-white font-semibold">
                Tap to Expand
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-6 bg-green-600 rounded-lg flex-row justify-center items-center py-3"
            onPress={handleContact}
          >
            <FontAwesome name="phone" size={16} color="#fff" />
            <Text className="text-white font-bold ml-2">Contact Agent</Text>
          </TouchableOpacity>

          {isAdmin && (
            <View className="mt-4 flex-row justify-center items-center gap-2">
              <TouchableOpacity
                onPress={handleSold}
                className="flex-1 bg-blue-600 rounded-lg flex-row justify-center items-center py-3 px-4"
              >
                <FontAwesome name="check-circle" size={16} color="#fff" />
                <Text className="text-white font-bold ml-2">
                  {property?.is_sold ? "Mark as Available" : "Mark as Sold"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                className="flex-1 bg-red-600 rounded-lg flex-row justify-center items-center py-3 px-4"
              >
                <FontAwesome name="trash" size={16} color="#fff" />
                <Text className="text-white font-bold ml-2">
                  Delete Property
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Modal
          visible={imageViewerVisible}
          transparent
          onRequestClose={() => setImageViewerVisible(false)}
        >
          <View className="flex-1 bg-black">
            <TouchableOpacity
              className="absolute top-4 left-4 z-10 p-2 bg-gray-800 rounded-full"
              onPress={() => setImageViewerVisible(false)}
            >
              <FontAwesome name="close" size={24} color="white" />
            </TouchableOpacity>
            <Image
              source={{ uri: property?.images[activeImageIndex] || "" }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </View>
        </Modal>
        {/* <ImageViewer
          images={property?.images.map((img) => ({ uri: img })) || []}
          imageIndex={activeImageIndex}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
        /> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const Card = ({
  label,
  icon,
  value,
}: {
  label: string;
  icon: keyof typeof FontAwesome.glyphMap;
  value: string | number;
}) => {
  return (
    <View className="items-center gap-1 p-2">
      <FontAwesome name={icon} size={24} color="#555" />
      <Text className="text-lg font-bold text-blue-600">{label}</Text>
      <Text className="text-base font-bold text-gray-400">{value}</Text>
    </View>
  );
};
