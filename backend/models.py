from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Table, Text
)
from sqlalchemy.orm import relationship
from .database import Base

def utc_now():
    return datetime.now(timezone.utc)

# Association table for Listing <-> Amenity
listing_amenity = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_host = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    wishlists = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    icon_name = Column(String(50), nullable=False)

    listings = relationship("Listing", back_populates="category")


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    icon_name = Column(String(50), nullable=False)

    listings = relationship("Listing", secondary=listing_amenity, back_populates="amenities")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    property_type = Column(String(50), nullable=False, default="Entire home") # e.g. Entire home, Private room, Villa, Cabin
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False, default="United States")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    price_per_night = Column(Float, nullable=False)
    cleaning_fee = Column(Float, default=50.0)
    service_fee = Column(Float, default=35.0)

    max_guests = Column(Integer, default=2)
    bedrooms = Column(Integer, default=1)
    beds = Column(Integer, default=1)
    baths = Column(Float, default=1.0)

    rating = Column(Float, default=4.9)
    reviews_count = Column(Integer, default=0)
    is_superhost = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    host = relationship("User", back_populates="listings")
    category = relationship("Category", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.display_order")
    amenities = relationship("Amenity", secondary=listing_amenity, back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
    wishlists = relationship("Wishlist", back_populates="listing", cascade="all, delete-orphan")


class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(800), nullable=False)
    is_primary = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)

    listing = relationship("Listing", back_populates="images")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    check_in = Column(String(20), nullable=False) # Stored as YYYY-MM-DD
    check_out = Column(String(20), nullable=False) # Stored as YYYY-MM-DD
    guests_count = Column(Integer, default=1)
    total_price = Column(Float, nullable=False)
    status = Column(String(20), default="CONFIRMED") # CONFIRMED, CANCELLED
    created_at = Column(DateTime, default=utc_now)

    listing = relationship("Listing", back_populates="bookings")
    user = relationship("User", back_populates="bookings")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    listing = relationship("Listing", back_populates="reviews")
    user = relationship("User", back_populates="reviews")


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="wishlists")
    listing = relationship("Listing", back_populates="wishlists")
