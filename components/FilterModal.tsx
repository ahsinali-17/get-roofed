import { PropertyType, useSearchStore } from "@/store/searchStore";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const TYPES: { label: string; value: PropertyType }[] = [
  { label: "All", value: null },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Villa", value: "villa" },
  { label: "Studio", value: "studio" },
];

const BEDS = [
  { label: "Any", value: null },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

const PRICE_PRESETS = [
  { label: "Under PKR 50L", min: null, max: 5000000 },
  { label: "PKR 50L – PKR 1Cr", min: 5000000, max: 10000000 },
  { label: "PKR 1Cr – PKR 2Cr", min: 10000000, max: 20000000 },
  { label: "Above PKR 2Cr", min: 20000000, max: null },
];

const chip = (active: boolean) =>
  `px-4 py-2 rounded-full border ${
    active ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"
  }`;

const chipText = (active: boolean) =>
  `text-sm font-semibold ${active ? "text-white" : "text-gray-600"}`;

export default function FilterModal({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  const {
    maxPrice,
    minPrice,
    bedrooms,
    propertyType,
    setMaxPrice,
    setMinPrice,
    setPropertyType,
    resetFilters,
    setBedrooms,
  } = useSearchStore();

  let shadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 1.41,
    elevation: 2,
  };

  const [localMinPrice, setLocalMinPrice] = useState(
    minPrice ? String(minPrice) : "",
  );
  const [localMaxPrice, setLocalMaxPrice] = useState(
    maxPrice ? String(maxPrice) : "",
  );

  let filterCount = [maxPrice, minPrice, bedrooms, propertyType].filter(
    Boolean,
  ).length;

  const handleReset = () => {
    setLocalMaxPrice("");
    setLocalMinPrice("");
    resetFilters();
    onClose();
  };

  const handleApply = () => {
    setMinPrice(localMinPrice ? Number(localMinPrice) : null);
    setMaxPrice(localMaxPrice ? Number(localMaxPrice) : null);
    onClose();
  };

  if (!show) return null;
  return (
    <Modal
      presentationStyle="pageSheet"
      collapsable={true}
      animationType="slide"
      onRequestClose={onClose}
      style={{ padding: 20, paddingBottom: 24 }}
    >
      <View
        className="relative py-3 px-5 flex-row justify-between items-center border-b border-gray-500"
        style={shadowStyle}
      >
        <TouchableOpacity onPress={onClose}>
          <FontAwesome name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="font-bold text-lg text-black">Filters</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text className="text-blue-500 font-semibold">Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="pt-5 pb-4 px-5 bg-gray-100">
        <Text className="font-bold text-2xl font-black mt-4 mb-4">
          Property Types
        </Text>
        <View className="flex-row flex-wrap gap-5">
          {TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              onPress={() => setPropertyType(type.value)}
              className={chip(propertyType === type.value)}
              style={shadowStyle}
            >
              <Text className={chipText(propertyType === type.value)}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="font-bold text-2xl font-black mt-8 mb-4">
          Bedrooms
        </Text>
        <View className="flex-row flex-wrap gap-5">
          {BEDS.map((bed) => (
            <TouchableOpacity
              key={bed.value}
              onPress={() => setBedrooms(bed.value)}
              className={chip(bedrooms === bed.value)}
              style={shadowStyle}
            >
              <Text className={chipText(bedrooms === bed.value)}>
                {bed.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="font-bold text-2xl font-black mt-8 mb-4">
          Price Range (PKR)
        </Text>
        <View className="flex-row flex-wrap gap-5">
          {[
            {
              label: "Min Price",
              value: localMinPrice,
              onChange: setLocalMinPrice,
              placeholder: "0",
            },
            {
              label: "Max Price",
              value: localMaxPrice,
              onChange: setLocalMaxPrice,
              placeholder: "Any",
            },
          ].map((range) => (
            <View className="flex-1" key={range.label}>
              <Text className="text-gray-500 text-sm">{range.label}</Text>
              <View
                className="flex-row items-center justify-center gap-2 rounded-xl bg-white p-2 mt-1"
                style={shadowStyle}
              >
                <Text className="text-sm font-semibold text-gray-400">PKR</Text>
                <TextInput
                  value={range.value ? range.value.toString() : ""}
                  placeholder={range.placeholder}
                  onChangeText={range.onChange}
                  keyboardType="numeric"
                  className="outline-none w-[70%] text-base font-medium text-gray-700"
                />
              </View>
            </View>
          ))}
        </View>

        <View className="mt-5 flex-row flex-wrap gap-5">
          {PRICE_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.label}
              onPress={() => {
                setLocalMaxPrice(preset.max ? String(preset.max) : "");
                setLocalMinPrice(preset.min ? String(preset.min) : "");
              }}
              className={chip(
                Number(localMinPrice) === Number(preset.min) &&
                  Number(localMaxPrice) === Number(preset.max),
              )}
              style={shadowStyle}
            >
              <Text
                className={chipText(
                  Number(localMinPrice) === Number(preset.min) &&
                    Number(localMaxPrice) === Number(preset.max),
                )}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View className="px-5 pt-5 pb-8 bg-white border-t border-gray-300 ">
        <TouchableOpacity
          className="bg-blue-600 rounded-2xl py-4"
          onPress={handleApply}
        >
          <Text className=" text-white font-bold text-xl text-center">
            Apply Filters ({filterCount})
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
