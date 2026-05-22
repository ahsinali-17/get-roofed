import { create } from "zustand";

export type PropertyType = "house" | "apartment" | "villa" | "studio" | null;

interface SearchState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  propertyType: PropertyType;
  setPropertyType: (type: PropertyType) => void;
  minPrice: number | null;
  setMinPrice: (price: number | null) => void;
  maxPrice: number | null;
  setMaxPrice: (price: number | null) => void;
  bedrooms: number | null;
  setBedrooms: (bedrooms: number | null) => void;
  resetFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  propertyType: null,
  setPropertyType: (type) => set({ propertyType: type }),
  minPrice: null,
  setMinPrice: (price) => set({ minPrice: price }),
  maxPrice: null,
  setMaxPrice: (price) => set({ maxPrice: price }),
  bedrooms: null,
  setBedrooms: (bedrooms) => set({ bedrooms }),
  resetFilters: () =>
    set({
      searchQuery: "",
      propertyType: null,
      minPrice: null,
      maxPrice: null,
      bedrooms: null,
    }),
}));
