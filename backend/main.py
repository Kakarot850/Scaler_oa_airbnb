from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_

from .database import get_db, engine, Base
from .models import User, Category, Amenity, Listing, ListingImage, Booking, Review, Wishlist, listing_amenity
from .schemas import (
    UserResponse, CategoryResponse, AmenityResponse,
    ListingSummaryResponse, ListingDetailResponse, ListingCreate, ListingUpdate,
    BookingCreate, BookingResponse, AvailabilityResponse, DateRange,
    WishlistToggleRequest, WishlistToggleResponse, HostDashboardResponse, ReviewCreate, ReviewResponse
)
from .seed import seed_database

# Ensure database tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Airbnb Clone API",
    description="Full-stack Airbnb Clone REST API built with FastAPI and SQLAlchemy",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "app": "Airbnb Clone API", "version": "1.0.0"}

@app.post("/api/seed", status_code=status.HTTP_200_OK)
def trigger_seed():
    """Drops and re-seeds database with rich mock data"""
    try:
        seed_database()
        return {"success": True, "message": "Database re-seeded successfully with 16 curated listings, categories, amenities, reviews and bookings."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    """Fetch all users to facilitate guest and host switching"""
    return db.query(User).all()

@app.get("/api/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Fetch all categories for the category pill bar"""
    return db.query(Category).all()

@app.get("/api/amenities", response_model=List[AmenityResponse])
def get_amenities(db: Session = Depends(get_db)):
    """Fetch all amenities for listings creation/filters"""
    return db.query(Amenity).all()

@app.get("/api/listings", response_model=List[ListingSummaryResponse])
def get_listings(
    category: Optional[str] = Query(None, description="Category name"),
    location: Optional[str] = Query(None, description="City, state or search query"),
    check_in: Optional[str] = Query(None, description="Check-in date (YYYY-MM-DD)"),
    check_out: Optional[str] = Query(None, description="Check-out date (YYYY-MM-DD)"),
    min_price: Optional[float] = Query(None, description="Minimum price per night"),
    max_price: Optional[float] = Query(None, description="Maximum price per night"),
    guests: Optional[int] = Query(None, description="Minimum guest capacity"),
    property_type: Optional[str] = Query(None, description="Property type"),
    user_id: Optional[int] = Query(None, description="Active user ID to check favorites"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search and filter listings with date availability collision checks
    """
    query = db.query(Listing).options(
        joinedload(Listing.images),
        joinedload(Listing.category)
    )

    # Category filter
    if category and category.lower() != "all":
        query = query.join(Listing.category).filter(Category.name.ilike(f"%{category}%"))

    # Location / text query
    if location and location.strip():
        loc_term = f"%{location.strip()}%"
        query = query.filter(
            or_(
                Listing.city.ilike(loc_term),
                Listing.state.ilike(loc_term),
                Listing.country.ilike(loc_term),
                Listing.title.ilike(loc_term)
            )
        )

    # Price range
    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)

    # Guest capacity
    if guests is not None and guests > 0:
        query = query.filter(Listing.max_guests >= guests)

    # Property type
    if property_type and property_type.lower() != "any":
        query = query.filter(Listing.property_type.ilike(f"%{property_type}%"))

    # Date Availability Collision Check
    # If check_in and check_out are provided, exclude listings that have overlapping confirmed bookings:
    # Overlap occurs when: booking.check_in < search.check_out AND booking.check_out > search.check_in
    if check_in and check_out:
        subquery_overlapping = db.query(Booking.listing_id).filter(
            Booking.status == "CONFIRMED",
            Booking.check_in < check_out,
            Booking.check_out > check_in
        ).subquery()
        query = query.filter(~Listing.id.in_(subquery_overlapping))

    offset = (page - 1) * limit
    listings = query.order_by(Listing.id.desc()).offset(offset).limit(limit).all()

    # Pre-fetch user wishlist if user_id is provided
    user_wishlist_ids = set()
    if user_id:
        favs = db.query(Wishlist.listing_id).filter(Wishlist.user_id == user_id).all()
        user_wishlist_ids = {f[0] for f in favs}

    result = []
    for l in listings:
        summary = ListingSummaryResponse(
            id=l.id,
            title=l.title,
            property_type=l.property_type,
            city=l.city,
            state=l.state,
            country=l.country,
            price_per_night=l.price_per_night,
            rating=l.rating,
            reviews_count=l.reviews_count,
            is_superhost=l.is_superhost,
            images=l.images,
            category=l.category,
            is_favorite=(l.id in user_wishlist_ids)
        )
        result.append(summary)

    return result

@app.get("/api/listings/{listing_id}", response_model=ListingDetailResponse)
def get_listing_detail(
    listing_id: int,
    user_id: Optional[int] = Query(None, description="Active user ID for wishlist status"),
    db: Session = Depends(get_db)
):
    """
    Returns complete listing metadata, host, images, amenities, and reviews.
    """
    listing = db.query(Listing).options(
        joinedload(Listing.host),
        joinedload(Listing.category),
        joinedload(Listing.images),
        joinedload(Listing.amenities),
        joinedload(Listing.reviews).joinedload(Review.user)
    ).filter(Listing.id == listing_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    is_fav = False
    if user_id:
        fav_exists = db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.listing_id == listing_id
        ).first()
        is_fav = bool(fav_exists)

    return ListingDetailResponse(
        id=listing.id,
        host_id=listing.host_id,
        category_id=listing.category_id,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        city=listing.city,
        state=listing.state,
        country=listing.country,
        latitude=listing.latitude,
        longitude=listing.longitude,
        price_per_night=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        service_fee=listing.service_fee,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        baths=listing.baths,
        rating=listing.rating,
        reviews_count=listing.reviews_count,
        is_superhost=listing.is_superhost,
        created_at=listing.created_at,
        host=listing.host,
        category=listing.category,
        images=listing.images,
        amenities=listing.amenities,
        reviews=listing.reviews,
        is_favorite=is_fav
    )

@app.get("/api/listings/{listing_id}/availability", response_model=AvailabilityResponse)
def get_listing_availability(listing_id: int, db: Session = Depends(get_db)):
    """
    Returns reserved date ranges for calendar disabling.
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    bookings = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == "CONFIRMED"
    ).all()

    ranges = [DateRange(check_in=b.check_in, check_out=b.check_out) for b in bookings]
    return AvailabilityResponse(listing_id=listing_id, booked_ranges=ranges)

@app.post("/api/listings", response_model=ListingDetailResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    host_id: int = Query(..., description="Host user ID"),
    db: Session = Depends(get_db)
):
    """Host creates a new listing"""
    host = db.query(User).filter(User.id == host_id).first()
    if not host:
        raise HTTPException(status_code=404, detail="Host user not found")

    # Mark user as host if not already
    host.is_host = True

    new_listing = Listing(
        host_id=host_id,
        category_id=payload.category_id,
        title=payload.title,
        description=payload.description,
        property_type=payload.property_type,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        latitude=payload.latitude,
        longitude=payload.longitude,
        price_per_night=payload.price_per_night,
        cleaning_fee=payload.cleaning_fee,
        service_fee=payload.service_fee,
        max_guests=payload.max_guests,
        bedrooms=payload.bedrooms,
        beds=payload.beds,
        baths=payload.baths,
        rating=5.0,
        reviews_count=0,
        is_superhost=payload.is_superhost
    )

    # Attach amenities
    if payload.amenity_ids:
        amenities = db.query(Amenity).filter(Amenity.id.in_(payload.amenity_ids)).all()
        new_listing.amenities = amenities

    db.add(new_listing)
    db.flush()

    # Add images
    images = payload.image_urls
    if not images:
        images = ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80"]

    for idx, img_url in enumerate(images):
        img = ListingImage(
            listing_id=new_listing.id,
            image_url=img_url,
            is_primary=(idx == 0),
            display_order=idx
        )
        db.add(img)

    db.commit()
    db.refresh(new_listing)
    return get_listing_detail(listing_id=new_listing.id, db=db)

@app.put("/api/listings/{listing_id}", response_model=ListingDetailResponse)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    host_id: int = Query(..., description="Host user ID"),
    db: Session = Depends(get_db)
):
    """Host updates an existing listing"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    update_dict = payload.model_dump(exclude_unset=True)
    image_urls = update_dict.pop("image_urls", None)
    amenity_ids = update_dict.pop("amenity_ids", None)

    for field, val in update_dict.items():
        setattr(listing, field, val)

    if amenity_ids is not None:
        listing.amenities = db.query(Amenity).filter(Amenity.id.in_(amenity_ids)).all()

    if image_urls is not None and len(image_urls) > 0:
        db.query(ListingImage).filter(ListingImage.listing_id == listing_id).delete()
        for idx, img_url in enumerate(image_urls):
            img = ListingImage(
                listing_id=listing_id,
                image_url=img_url,
                is_primary=(idx == 0),
                display_order=idx
            )
            db.add(img)

    db.commit()
    return get_listing_detail(listing_id=listing_id, db=db)

@app.delete("/api/listings/{listing_id}", status_code=status.HTTP_200_OK)
def delete_listing(
    listing_id: int,
    host_id: int = Query(..., description="Host user ID"),
    db: Session = Depends(get_db)
):
    """Host deletes a listing"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    db.delete(listing)
    db.commit()
    return {"success": True, "message": "Listing deleted successfully"}

@app.post("/api/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    """
    Create a booking with strict date collision check:
    Prevents double booking: check_in < existing_check_out AND check_out > existing_check_in
    """
    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate dates
    try:
        ci = datetime.strptime(payload.check_in, "%Y-%m-%d").date()
        co = datetime.strptime(payload.check_out, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Expected YYYY-MM-DD")

    if co <= ci:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")

    # Strict overlap collision check:
    # Atomic validation: check_in < existing_check_out AND check_out > existing_check_in
    overlapping = db.query(Booking).filter(
        Booking.listing_id == payload.listing_id,
        Booking.status == "CONFIRMED",
        Booking.check_in < payload.check_out,
        Booking.check_out > payload.check_in
    ).first()

    if overlapping:
        raise HTTPException(
            status_code=409,
            detail=f"Selected dates conflict with an existing reservation ({overlapping.check_in} to {overlapping.check_out}). Please choose other dates."
        )

    # Calculate nights and total price
    nights = (co - ci).days
    total_price = (nights * listing.price_per_night) + listing.cleaning_fee + listing.service_fee

    booking = Booking(
        listing_id=payload.listing_id,
        user_id=payload.user_id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests_count=payload.guests_count,
        total_price=round(total_price, 2),
        status="CONFIRMED"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Return booking with listing summary
    return db.query(Booking).options(
        joinedload(Booking.listing).joinedload(Listing.images),
        joinedload(Booking.listing).joinedload(Listing.category),
        joinedload(Booking.user)
    ).filter(Booking.id == booking.id).first()

@app.delete("/api/bookings/{booking_id}", status_code=status.HTTP_200_OK)
def cancel_booking(
    booking_id: int,
    user_id: int = Query(..., description="User ID requesting cancellation"),
    db: Session = Depends(get_db)
):
    """Cancel an active booking"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this reservation")

    booking.status = "CANCELLED"
    db.commit()
    return {"success": True, "message": "Reservation cancelled successfully"}

@app.get("/api/trips", response_model=List[BookingResponse])
def get_trips(
    user_id: int = Query(..., description="Active user ID"),
    db: Session = Depends(get_db)
):
    """Fetch bookings for the active user"""
    return db.query(Booking).options(
        joinedload(Booking.listing).joinedload(Listing.images),
        joinedload(Booking.listing).joinedload(Listing.category),
        joinedload(Booking.user)
    ).filter(
        Booking.user_id == user_id
    ).order_by(Booking.check_in.desc()).all()

@app.get("/api/host/dashboard", response_model=HostDashboardResponse)
def get_host_dashboard(
    host_id: int = Query(..., description="Host user ID"),
    db: Session = Depends(get_db)
):
    """Host dashboard: listings, incoming bookings, and revenue metrics"""
    host = db.query(User).filter(User.id == host_id).first()
    if not host:
        raise HTTPException(status_code=404, detail="Host user not found")

    listings = db.query(Listing).options(
        joinedload(Listing.host),
        joinedload(Listing.category),
        joinedload(Listing.images),
        joinedload(Listing.amenities),
        joinedload(Listing.reviews)
    ).filter(Listing.host_id == host_id).all()

    listing_ids = [l.id for l in listings]

    bookings = []
    total_revenue = 0.0
    if listing_ids:
        bookings = db.query(Booking).options(
            joinedload(Booking.listing).joinedload(Listing.images),
            joinedload(Booking.user)
        ).filter(
            Booking.listing_id.in_(listing_ids),
            Booking.status == "CONFIRMED"
        ).order_by(Booking.created_at.desc()).all()

        total_revenue = sum(b.total_price for b in bookings)

    return HostDashboardResponse(
        total_listings=len(listings),
        total_bookings=len(bookings),
        total_revenue=round(total_revenue, 2),
        listings=listings,
        recent_bookings=bookings
    )

@app.post("/api/wishlist/toggle", response_model=WishlistToggleResponse)
def toggle_wishlist(payload: WishlistToggleRequest, db: Session = Depends(get_db)):
    """Toggle wishlist item for active user"""
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == payload.user_id,
        Wishlist.listing_id == payload.listing_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return WishlistToggleResponse(user_id=payload.user_id, listing_id=payload.listing_id, is_saved=False)
    else:
        new_fav = Wishlist(user_id=payload.user_id, listing_id=payload.listing_id)
        db.add(new_fav)
        db.commit()
        return WishlistToggleResponse(user_id=payload.user_id, listing_id=payload.listing_id, is_saved=True)

@app.get("/api/wishlists", response_model=List[ListingSummaryResponse])
def get_wishlists(
    user_id: int = Query(..., description="Active user ID"),
    db: Session = Depends(get_db)
):
    """Fetch all saved listings for user"""
    wishlists = db.query(Wishlist).options(
        joinedload(Wishlist.listing).joinedload(Listing.images),
        joinedload(Wishlist.listing).joinedload(Listing.category)
    ).filter(Wishlist.user_id == user_id).all()

    result = []
    for w in wishlists:
        if w.listing:
            l = w.listing
            result.append(
                ListingSummaryResponse(
                    id=l.id,
                    title=l.title,
                    property_type=l.property_type,
                    city=l.city,
                    state=l.state,
                    country=l.country,
                    price_per_night=l.price_per_night,
                    rating=l.rating,
                    reviews_count=l.reviews_count,
                    is_superhost=l.is_superhost,
                    images=l.images,
                    category=l.category,
                    is_favorite=True
                )
            )
    return result

@app.post("/api/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    listing_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_db)
):
    """Add a review to a listing and update the listing average rating"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    review = Review(
        listing_id=listing_id,
        user_id=payload.user_id,
        rating=payload.rating,
        comment=payload.comment
    )
    db.add(review)
    db.flush()

    # Recalculate listing rating
    all_reviews = db.query(Review).filter(Review.listing_id == listing_id).all()
    avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
    listing.rating = round(avg_rating, 2)
    listing.reviews_count = len(all_reviews)

    db.commit()
    db.refresh(review)
    return db.query(Review).options(joinedload(Review.user)).filter(Review.id == review.id).first()
