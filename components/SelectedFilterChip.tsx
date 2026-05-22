import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SelectedFilterChip({
  selectedFilters,
}: {
  selectedFilters?: {
    label: string;
    value: string | number;
    onClear: () => void;
  }[];
}) {
  if (!selectedFilters || selectedFilters.length === 0) {
    return null;
  }
  return (
    <View className="my-4 w-full flex-row flex-wrap items-center gap-3">
      {selectedFilters?.map((filter) => (
        <View
          key={filter.label}
          className="bg-blue-600 px-3 py-2 rounded-full flex-row items-center gap-2"
        >
          <Text className="text-sm text-bold text-gray-100">
            {filter.label}: {filter.value}
          </Text>
          <TouchableOpacity onPress={filter.onClear}>
            <FontAwesome name="close" size={12} color="#f9f9f9" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
