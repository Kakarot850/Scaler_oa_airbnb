export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  is_host: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon_name: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon_name: string;
}

export interface ListingImage {
  id: number;
  listing_id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Review {
  id: number;
  listing_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user?: User;
}

export interface ListingSummary {
  id: number;
  title: string;
  property_type: string;
  city: string;
  state: string;
  country: string;
  price_per_night: number;
  rating: number;
  reviews_count: number;
  is_superhost: boolean;
  images: ListingImage[];
  category?: Category;
  is_favorite?: boolean;
}

export interface ListingDetail extends ListingSummary {
  host_id: number;
  category_id?: number;
  description: string;
  latitude?: number;
  longitude?: number;
  cleaning_fee: number;
  service_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  created_at: string;
  host?: User;
  amenities: Amenity[];
  reviews: Review[];
}

export interface Booking {
  id: number;
  listing_id: number;
  user_id: number;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  status: "CONFIRMED" | "CANCELLED";
  created_at: string;
  listing?: ListingSummary;
  user?: User;
}

export interface DateRange {
  check_in: string;
  check_out: string;
}

export interface AvailabilityResponse {
  listing_id: number;
  booked_ranges: DateRange[];
}

export interface HostDashboardData {
  total_listings: number;
  total_bookings: number;
  total_revenue: number;
  listings: ListingDetail[];
  recent_bookings: Booking[];
}

export interface SearchFilters {
  category?: string;
  location?: string;
  check_in?: string;
  check_out?: string;
  min_price?: number;
  max_price?: number;
  guests?: number;
  property_type?: string;
}
