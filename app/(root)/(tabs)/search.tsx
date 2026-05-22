import FilterModal from "@/components/FilterModal";
import PropertyCard from "@/components/PropertyCard";
import SelectedFilterChip from "@/components/SelectedFilterChip";
import { supabase } from "@/lib/Supabase";
import { formatPrice } from "@/lib/utils";
import { useSearchStore } from "@/store/searchStore";
import { Property } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Search() {
  const {
    searchQuery,
    setSearchQuery,
    minPrice,
    maxPrice,
    bedrooms,
    propertyType,
    setMaxPrice,
    setMinPrice,
    setBedrooms,
    setPropertyType,
  } = useSearchStore();

  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedFilters = [
    minPrice
      ? {
          label: "min",
          value: formatPrice(minPrice),
          onClear: () => setMinPrice(null),
        }
      : null,
    maxPrice
      ? {
          label: "max",
          value: formatPrice(maxPrice),
          onClear: () => setMaxPrice(null),
        }
      : null,
    bedrooms
      ? { label: "bedrooms", value: bedrooms, onClear: () => setBedrooms(null) }
      : null,
    propertyType
      ? {
          label: "propertyType",
          value: propertyType,
          onClear: () => setPropertyType(null),
        }
      : null,
  ].filter((f): f is NonNullable<typeof f> => f !== null);

  const filterCount = [maxPrice, minPrice, bedrooms, propertyType].filter(
    Boolean,
  ).length;

  useEffect(() => {
    fetchResults();
  }, [searchQuery, minPrice, maxPrice, bedrooms, propertyType]);

  const fetchResults = async () => {
    const query = supabase.from("properties").select("*");
    if (propertyType) query.eq("type", propertyType);
    if (minPrice) query.gte("price", minPrice);
    if (maxPrice) query.lte("price", maxPrice);
    if (bedrooms) query.eq("bedrooms", bedrooms);
    if (searchQuery)
      query.or(`title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);

    try {
      setLoading(true);
      const { data, error } = await query.order("created_at", {
        ascending: false,
      });
      if (error) throw error;
      setResults(data as Property[]);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 py-4 px-5">
      <Text className="font-bold text-xl text-black mb-3">
        Search Properties
      </Text>

      <View className="w-full flex-row items-center gap-3 mb-4">
        <View
          className="flex-1 p-3 flex-row items-center rounded-xl gap-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.4,
            shadowRadius: 1.41,
            elevation: 2,
          }}
        >
          <FontAwesome name="search" color="#6B7280" size={24} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for properties..."
            placeholderClassName="text-gray-500 text-lg ml-2 flex-1"
            className="flex-1 border-0 outline-none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="rounded-full"
            >
              <FontAwesome name="close" color="#6B7280" size={16} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          className={`relative rounded-xl p-3 ${filterCount > 0 ? "bg-blue-600" : "bg-gray-100"}`}
          onPress={() => setShowFilters(!showFilters)}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.4,
            shadowRadius: 1.41,
            elevation: 2,
          }}
        >
          <FontAwesome
            name="filter"
            color={filterCount > 0 ? "#f9f9f9" : "#376acf"}
            size={24}
          />
          {filterCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {filterCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* selected Filter */}
      <SelectedFilterChip selectedFilters={selectedFilters} />

      <FlatList
        className="flex-1"
        data={results}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PropertyCard property={item} />}
        ListHeaderComponent={
          <Text className="text-gray-500 font-semibold mt-2 mb-4">
            {loading ? "Loading..." : `${results.length + 1} properties found.`}
          </Text>
        }
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            {!loading && "No properties found."}
          </Text>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      {/* Filter Modal */}
      <FilterModal show={showFilters} onClose={() => setShowFilters(false)} />
    </View>
  );
}
