import {
  ListingSummary,
  ListingDetail,
  Category,
  Amenity,
  Booking,
  User,
  AvailabilityResponse,
  HostDashboardData,
  SearchFilters,
  Review,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    // Don't cache on client side to ensure dynamic updates reflect immediately
    cache: "no-store",
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Categories & Amenities
  getCategories: () => request<Category[]>("/api/categories"),
  getAmenities: () => request<Amenity[]>("/api/amenities"),

  // Users
  getUsers: () => request<User[]>("/api/users"),

  // Seed
  seedDatabase: () =>
    request<{ success: boolean; message: string }>("/api/seed", {
      method: "POST",
    }),

  // Listings
  getListings: (filters: SearchFilters = {}, userId?: number) => {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.location) params.append("location", filters.location);
    if (filters.check_in) params.append("check_in", filters.check_in);
    if (filters.check_out) params.append("check_out", filters.check_out);
    if (filters.min_price !== undefined) params.append("min_price", String(filters.min_price));
    if (filters.max_price !== undefined) params.append("max_price", String(filters.max_price));
    if (filters.guests !== undefined && filters.guests > 0)
      params.append("guests", String(filters.guests));
    if (filters.property_type) params.append("property_type", filters.property_type);
    if (userId) params.append("user_id", String(userId));

    const qs = params.toString();
    return request<ListingSummary[]>(`/api/listings${qs ? `?${qs}` : ""}`);
  },

  getListing: (id: number, userId?: number) => {
    const qs = userId ? `?user_id=${userId}` : "";
    return request<ListingDetail>(`/api/listings/${id}${qs}`);
  },

  getListingAvailability: (id: number) =>
    request<AvailabilityResponse>(`/api/listings/${id}/availability`),

  createListing: (data: any, hostId: number) =>
    request<ListingDetail>(`/api/listings?host_id=${hostId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateListing: (id: number, data: any, hostId: number) =>
    request<ListingDetail>(`/api/listings/${id}?host_id=${hostId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteListing: (id: number, hostId: number) =>
    request<{ success: boolean; message: string }>(`/api/listings/${id}?host_id=${hostId}`, {
      method: "DELETE",
    }),

  // Bookings
  createBooking: (payload: {
    listing_id: number;
    user_id: number;
    check_in: string;
    check_out: string;
    guests_count: number;
  }) =>
    request<Booking>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  cancelBooking: (bookingId: number, userId: number) =>
    request<{ success: boolean; message: string }>(
      `/api/bookings/${bookingId}?user_id=${userId}`,
      { method: "DELETE" }
    ),

  getTrips: (userId: number) => request<Booking[]>(`/api/trips?user_id=${userId}`),

  // Wishlist
  toggleWishlist: (userId: number, listingId: number) =>
    request<{ user_id: number; listing_id: number; is_saved: boolean }>(
      "/api/wishlist/toggle",
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId, listing_id: listingId }),
      }
    ),

  getWishlists: (userId: number) =>
    request<ListingSummary[]>(`/api/wishlists?user_id=${userId}`),

  // Host Dashboard
  getHostDashboard: (hostId: number) =>
    request<HostDashboardData>(`/api/host/dashboard?host_id=${hostId}`),

  // Reviews
  addReview: (listingId: number, payload: { user_id: number; rating: number; comment: string }) =>
    request<Review>(`/api/reviews?listing_id=${listingId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
