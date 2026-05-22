export interface PropertyType {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  area_sqft: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  images: string[];
  latitude: number;
  longitude: number;
  is_featured: boolean;
  is_sold?: boolean;
  created_at: string;
}
