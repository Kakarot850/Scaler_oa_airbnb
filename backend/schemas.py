from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    avatar_url: Optional[str] = None
    is_host: bool = False

class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Category Schemas
class CategoryResponse(BaseModel):
    id: int
    name: str
    icon_name: str
    model_config = ConfigDict(from_attributes=True)

# Amenity Schemas
class AmenityResponse(BaseModel):
    id: int
    name: str
    icon_name: str
    model_config = ConfigDict(from_attributes=True)

# Listing Image Schemas
class ListingImageBase(BaseModel):
    image_url: str
    is_primary: bool = False
    display_order: int = 0

class ListingImageResponse(ListingImageBase):
    id: int
    listing_id: int
    model_config = ConfigDict(from_attributes=True)

# Review Schemas
class ReviewBase(BaseModel):
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: str

class ReviewCreate(ReviewBase):
    user_id: int

class ReviewResponse(ReviewBase):
    id: int
    listing_id: int
    user_id: int
    user: Optional[UserResponse] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Booking Schemas
class BookingCreate(BaseModel):
    listing_id: int
    user_id: int
    check_in: str # YYYY-MM-DD
    check_out: str # YYYY-MM-DD
    guests_count: int = Field(default=1, ge=1)

class BookingResponse(BaseModel):
    id: int
    listing_id: int
    user_id: int
    check_in: str
    check_out: str
    guests_count: int
    total_price: float
    status: str
    created_at: datetime
    listing: Optional["ListingSummaryResponse"] = None
    user: Optional[UserResponse] = None
    model_config = ConfigDict(from_attributes=True)

# Listing Schemas
class ListingCreate(BaseModel):
    title: str
    description: str
    property_type: str = "Entire home"
    category_id: Optional[int] = None
    city: str
    state: str
    country: str = "United States"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: float
    cleaning_fee: float = 50.0
    service_fee: float = 35.0
    max_guests: int = 2
    bedrooms: int = 1
    beds: int = 1
    baths: float = 1.0
    is_superhost: bool = False
    image_urls: List[str] = []
    amenity_ids: List[int] = []

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    category_id: Optional[int] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    price_per_night: Optional[float] = None
    cleaning_fee: Optional[float] = None
    service_fee: Optional[float] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    baths: Optional[float] = None
    is_superhost: Optional[bool] = None
    image_urls: Optional[List[str]] = None
    amenity_ids: Optional[List[int]] = None

class ListingSummaryResponse(BaseModel):
    id: int
    title: str
    property_type: str
    city: str
    state: str
    country: str
    price_per_night: float
    rating: float
    reviews_count: int
    is_superhost: bool
    images: List[ListingImageResponse] = []
    category: Optional[CategoryResponse] = None
    is_favorite: Optional[bool] = False
    model_config = ConfigDict(from_attributes=True)

class ListingDetailResponse(BaseModel):
    id: int
    host_id: int
    category_id: Optional[int] = None
    title: str
    description: str
    property_type: str
    city: str
    state: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: float
    cleaning_fee: float
    service_fee: float
    max_guests: int
    bedrooms: int
    beds: int
    baths: float
    rating: float
    reviews_count: int
    is_superhost: bool
    created_at: datetime

    host: Optional[UserResponse] = None
    category: Optional[CategoryResponse] = None
    images: List[ListingImageResponse] = []
    amenities: List[AmenityResponse] = []
    reviews: List[ReviewResponse] = []
    is_favorite: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)

class DateRange(BaseModel):
    check_in: str
    check_out: str

class AvailabilityResponse(BaseModel):
    listing_id: int
    booked_ranges: List[DateRange]

class WishlistToggleRequest(BaseModel):
    user_id: int
    listing_id: int

class WishlistToggleResponse(BaseModel):
    user_id: int
    listing_id: int
    is_saved: bool

class HostDashboardResponse(BaseModel):
    total_listings: int
    total_bookings: int
    total_revenue: float
    listings: List[ListingDetailResponse]
    recent_bookings: List[BookingResponse]
