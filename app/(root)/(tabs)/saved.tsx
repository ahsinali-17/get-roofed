import PropertyCard from "@/components/PropertyCard";
import { useSupabase } from "@/hooks/useSupabase";
import { useSaveCountStore } from "@/store/saveCountStore";
import { Property } from "@/types";
import { useAuth } from "@clerk/expo";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SavedItem {
  id: string;
  property: Property;
}

export default function Saved() {
  const authSupabase = useSupabase();
  const { userId } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const { decrement } = useSaveCountStore();

  const fetchSavedItems = async () => {
    if (!userId || loading) return;
    setLoading(true);
    try {
      const { data, error } = await authSupabase
        .from("saved_properties")
        .select("id,property:property_id(*)")
        .eq("user_clerk_id", userId);
      if (error) throw error;
      setSavedItems((data as unknown as SavedItem[]) ?? []);
    } catch (error) {
      console.error("Error fetching saved items:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedItems();
    }, [userId]),
  );

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 py-4 px-5">
        <Text className="font-bold text-xl text-black mb-1">Saved</Text>
        {!loading && (
          <Text className="text-gray-500 mb-3">
            {savedItems.length} saved item(s).
          </Text>
        )}
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={savedItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ flex: 1, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center">
                <View className="p-3 rounded-full bg-gray-200 items-center justify-center">
                  <FontAwesome name="heart-o" size={64} color="#e16363" />
                </View>
                <Text className="text-gray-500 mt-4">
                  No saved properties yet.
                </Text>
                <Text className="text-gray-500 text-center mt-2">
                  Tap the heart icon on a property to save it here for later!
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <PropertyCard
                property={item.property}
                onUnsave={() => {
                  setSavedItems(savedItems.filter((i) => i.id !== item.id));
                  decrement();
                }}
                showSaved={true}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
