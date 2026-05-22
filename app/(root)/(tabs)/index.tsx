import FeaturedCard from "@/components/FeaturedCard";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/lib/Supabase";
import { Property } from "@/types/index";
import { useUser } from "@clerk/expo";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const router = useRouter();
  const { user } = useUser();

  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const { data: featuredProperties } = await supabase
        .from("properties")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });
      setFeatured(featuredProperties ?? []);

      const { data: recommendedProperties } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      setRecommended(recommendedProperties ?? []);
    } catch (error) {
      console.error("Error fetching featured properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, []),
  );

  if (!user) {
    router.replace("/sign-in");
    return null;
  }
  return (
    <FlatList
      data={recommended}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      ListHeaderComponent={
        <View>
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 pt-4 pb-4">
            <Image
              source={require("@/assets/images/kribb.png")}
              style={{ width: 48, height: 36 }}
              resizeMode="contain"
            />
            <Text className="text-lg text-gray-600">
              Good{" "}
              {new Date().getHours() < 12
                ? "Morning"
                : new Date().getHours() < 18
                  ? "Afternoon"
                  : "Evening"}
              👋{" "}
              <Text className="text-gray-900 font-semibold">
                {user.firstName || "User"}
              </Text>
            </Text>
          </View>

          {/* Search Bar */}
          <View className="w-full px-5 flex-row items-center gap-2 mb-4">
            <TouchableOpacity
              onPress={() => router.push("/search")}
              className="flex-1 flex-row justify-start items-center mx-5 p-2 rounded-xl gap-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,
                elevation: 2,
              }}
            >
              <FontAwesome name="search" color="#6B7280" size={24} />
              <Text className="text-gray-500 text-base ml-2 flex-1">
                Search for properties...
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push("/(root)/(tabs)/search?openFilters=true")
              }
            >
              <FontAwesome name="filter" color="#5183e6" size={24} />
            </TouchableOpacity>
          </View>

          {/* Featured Properties */}
          <View className="px-5 mb-4">
            <Text className="text-lg text-gray-900 font-bold mb-4">
              Featured Properties
            </Text>
            {loading ? (
              <ActivityIndicator
                size="small"
                color="#5183e6"
                className="my-10"
              />
            ) : (
              <FlatList
                data={featured}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => <FeaturedCard property={item} />}
                ListEmptyComponent={
                  !loading ? (
                    <View className="items-center py-10">
                      <Text className="text-lg text-gray-400 font-bold">
                        No Featured Properties Found...
                      </Text>
                    </View>
                  ) : null
                }
              />
            )}
          </View>
          {/* Recommended Header */}
          <Text className="text-lg text-gray-900 font-bold mb-4 px-5">
            Recommended
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View className="px-5">
          <PropertyCard property={item} />
        </View>
      )}
      ListEmptyComponent={
        !loading ? (
          <View className="items-center py-10">
            <Text className="text-lg text-gray-400 font-bold">
              No Properties Found...
            </Text>
          </View>
        ) : null
      }
    />
  );
}
