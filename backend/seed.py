import os
import sys
from datetime import datetime, timezone, timedelta
from .database import engine, SessionLocal, Base
from .models import User, Category, Amenity, Listing, ListingImage, Booking, Review, Wishlist, listing_amenity

def seed_database():
    print("Dropping existing tables and recreating schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding Users...")
        # 4 Hosts, 2 Regular Guests
        users_data = [
            {
                "name": "Sarah Jenkins",
                "email": "sarah.jenkins@airbnb-clone.com",
                "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
                "is_host": True
            },
            {
                "name": "Alexandre Dupont",
                "email": "alex.dupont@airbnb-clone.com",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                "is_host": True
            },
            {
                "name": "Elena Rostova",
                "email": "elena.rostova@airbnb-clone.com",
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
                "is_host": True
            },
            {
                "name": "Marcus Vance",
                "email": "marcus.vance@airbnb-clone.com",
                "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
                "is_host": True
            },
            {
                "name": "Chloe Bennett",
                "email": "chloe.guest@airbnb-clone.com",
                "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
                "is_host": False
            },
            {
                "name": "David Kim",
                "email": "david.guest@airbnb-clone.com",
                "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
                "is_host": False
            }
        ]

        created_users = []
        for u in users_data:
            user = User(**u)
            db.add(user)
            created_users.append(user)
        db.flush()

        print("Seeding Categories...")
        categories_data = [
            {"name": "Beachfront", "icon_name": "Waves"},
            {"name": "Cabins", "icon_name": "Home"},
            {"name": "Mansions", "icon_name": "Castle"},
            {"name": "Trending", "icon_name": "Flame"},
            {"name": "Lakefront", "icon_name": "Ship"},
            {"name": "Amazing views", "icon_name": "Mountain"},
            {"name": "Luxe", "icon_name": "Sparkles"},
            {"name": "Treehouses", "icon_name": "Trees"},
            {"name": "Tiny homes", "icon_name": "Compass"},
            {"name": "Countryside", "icon_name": "Sun"},
            {"name": "Desert", "icon_name": "Sunset"},
            {"name": "Skiing", "icon_name": "Snowflake"}
        ]

        category_map = {}
        for c in categories_data:
            cat = Category(**c)
            db.add(cat)
            category_map[c["name"]] = cat
        db.flush()

        print("Seeding Amenities...")
        amenities_data = [
            {"name": "Fast Wifi (300+ Mbps)", "icon_name": "Wifi"},
            {"name": "Dedicated workspace", "icon_name": "Laptop"},
            {"name": "Free parking on premises", "icon_name": "Car"},
            {"name": "Private swimming pool", "icon_name": "Waves"},
            {"name": "Hot tub / Jacuzzi", "icon_name": "Bath"},
            {"name": "Air conditioning", "icon_name": "Wind"},
            {"name": "Chef's Kitchen", "icon_name": "Utensils"},
            {"name": "Panoramic ocean view", "icon_name": "Eye"},
            {"name": "EV charger", "icon_name": "Zap"},
            {"name": "Indoor fireplace", "icon_name": "Flame"},
            {"name": "Washer & Dryer", "icon_name": "Shirt"},
            {"name": "BBQ grill & outdoor patio", "icon_name": "Sun"},
            {"name": "Ski-in / Ski-out access", "icon_name": "Snowflake"},
            {"name": "Direct beach access", "icon_name": "Palmtree"}
        ]

        amenity_map = {}
        for a in amenities_data:
            amenity = Amenity(**a)
            db.add(amenity)
            amenity_map[a["name"]] = amenity
        db.flush()

        print("Seeding Listings...")
        listings_seed = [
            {
                "host": created_users[0],
                "category": category_map["Beachfront"],
                "title": "The Glass Pavilion: Waterfront Malibu Sanctuary",
                "description": "Perched directly above the Pacific surf, this architectural glass masterpiece offers uninterrupted 180-degree ocean views, floor-to-ceiling retractable glass walls, and a private stairway straight down to sandy El Matador Beach. Watch dolphins play from your private heated infinity pool while enjoying the Pacific sunset.",
                "property_type": "Entire villa",
                "city": "Malibu",
                "state": "California",
                "country": "United States",
                "latitude": 34.0259,
                "longitude": -118.7798,
                "price_per_night": 890.0,
                "cleaning_fee": 180.0,
                "service_fee": 120.0,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 3,
                "baths": 3.5,
                "rating": 4.98,
                "reviews_count": 84,
                "is_superhost": True,
                "amenities": ["Fast Wifi (300+ Mbps)", "Private swimming pool", "Hot tub / Jacuzzi", "Panoramic ocean view", "Direct beach access", "Chef's Kitchen", "Free parking on premises", "Air conditioning"],
                "images": [
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[1],
                "category": category_map["Cabins"],
                "title": "Nordic A-Frame Cabin in the Pines",
                "description": "Escape the noise in this designer cedar A-Frame surrounded by towering ponderosa pines. Features a wood-burning Scandinavian fireplace, custom cedar soaking tub on the cantilevered deck, and panoramic star-gazing skylights above the primary loft bed.",
                "property_type": "Entire cabin",
                "city": "Aspen",
                "state": "Colorado",
                "country": "United States",
                "latitude": 39.1911,
                "longitude": -106.8175,
                "price_per_night": 460.0,
                "cleaning_fee": 110.0,
                "service_fee": 65.0,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "baths": 2.0,
                "rating": 4.95,
                "reviews_count": 142,
                "is_superhost": True,
                "amenities": ["Indoor fireplace", "Hot tub / Jacuzzi", "Dedicated workspace", "Free parking on premises", "Fast Wifi (300+ Mbps)", "BBQ grill & outdoor patio"],
                "images": [
                    "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[2],
                "category": category_map["Mansions"],
                "title": "Villa Bellissima: Tuscan-Style Hillside Estate",
                "description": "An opulent 7,500 sq ft Tuscan estate nestled amidst sprawling vineyards and olive trees. Boasts a private wine cellar, Olympic-length infinity pool with sunset views, tennis court, and full outdoor entertainment pavilion with wood-fired pizza oven.",
                "property_type": "Entire estate",
                "city": "Napa Valley",
                "state": "California",
                "country": "United States",
                "latitude": 38.2975,
                "longitude": -122.2869,
                "price_per_night": 1450.0,
                "cleaning_fee": 250.0,
                "service_fee": 200.0,
                "max_guests": 10,
                "bedrooms": 5,
                "beds": 6,
                "baths": 5.5,
                "rating": 5.0,
                "reviews_count": 67,
                "is_superhost": True,
                "amenities": ["Private swimming pool", "Hot tub / Jacuzzi", "Chef's Kitchen", "Free parking on premises", "Fast Wifi (300+ Mbps)", "EV charger", "BBQ grill & outdoor patio"],
                "images": [
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[3],
                "category": category_map["Trending"],
                "title": "Modernist Desert Mirror Oasis & Stargazing Pod",
                "description": "Featured in Architectural Digest, this reflective mirror home blends invisibly into Joshua Tree's mystic boulder landscape. Complete with 360-degree mirrored exterior, indoor sound bath system, heated plunge pool, and stargazing telescope deck.",
                "property_type": "Entire home",
                "city": "Joshua Tree",
                "state": "California",
                "country": "United States",
                "latitude": 34.1347,
                "longitude": -116.3131,
                "price_per_night": 520.0,
                "cleaning_fee": 120.0,
                "service_fee": 75.0,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "baths": 2.0,
                "rating": 4.97,
                "reviews_count": 118,
                "is_superhost": True,
                "amenities": ["Private swimming pool", "Hot tub / Jacuzzi", "Air conditioning", "Indoor fireplace", "Fast Wifi (300+ Mbps)", "EV charger"],
                "images": [
                    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[0],
                "category": category_map["Lakefront"],
                "title": "Emerald Waters: Lake Tahoe Cedar Chalet",
                "description": "Step right onto your private deep-water dock on Lake Tahoe. This updated luxury chalet features a dramatic soaring cathedral ceiling, floor-to-ceiling stone fireplace, paddleboards & kayaks included, and an outdoor cedar barrel sauna overlooking the clear blue bay.",
                "property_type": "Entire chalet",
                "city": "Lake Tahoe",
                "state": "Nevada",
                "country": "United States",
                "latitude": 39.0968,
                "longitude": -120.0324,
                "price_per_night": 720.0,
                "cleaning_fee": 150.0,
                "service_fee": 95.0,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 5,
                "baths": 3.0,
                "rating": 4.94,
                "reviews_count": 93,
                "is_superhost": True,
                "amenities": ["Fast Wifi (300+ Mbps)", "Indoor fireplace", "Hot tub / Jacuzzi", "Free parking on premises", "BBQ grill & outdoor patio", "Chef's Kitchen"],
                "images": [
                    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[1],
                "category": category_map["Amazing views"],
                "title": "Eagle's Nest: Cliffside Penthouse above Big Sur",
                "description": "Cantilevered over the majestic cliffs of the central California coast. Hear the waves crashing 400 feet below while watching whales migrate from your heated terrace. Designed by Frank Lloyd Wright apprentice with warm redwood finishes.",
                "property_type": "Entire villa",
                "city": "Big Sur",
                "state": "California",
                "country": "United States",
                "latitude": 36.2704,
                "longitude": -121.8081,
                "price_per_night": 950.0,
                "cleaning_fee": 175.0,
                "service_fee": 130.0,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "baths": 2.5,
                "rating": 4.99,
                "reviews_count": 52,
                "is_superhost": True,
                "amenities": ["Panoramic ocean view", "Hot tub / Jacuzzi", "Indoor fireplace", "Fast Wifi (300+ Mbps)", "Free parking on premises"],
                "images": [
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[2],
                "category": category_map["Luxe"],
                "title": "The Beverly Hills Palms: Ultra-Modern Designer Villa",
                "description": "Ultimate Beverly Hills prestige. Gated private motor court, zero-edge heated infinity pool with swim-up bar, subterranean movie theater, professional gym, and smart home automation throughout. Concierge and daily housekeeping available.",
                "property_type": "Entire villa",
                "city": "Beverly Hills",
                "state": "California",
                "country": "United States",
                "latitude": 34.0736,
                "longitude": -118.4004,
                "price_per_night": 1850.0,
                "cleaning_fee": 300.0,
                "service_fee": 260.0,
                "max_guests": 12,
                "bedrooms": 6,
                "beds": 7,
                "baths": 7.0,
                "rating": 4.96,
                "reviews_count": 39,
                "is_superhost": True,
                "amenities": ["Private swimming pool", "Hot tub / Jacuzzi", "Chef's Kitchen", "EV charger", "Air conditioning", "Dedicated workspace", "Washer & Dryer"],
                "images": [
                    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[3],
                "category": category_map["Treehouses"],
                "title": "Redwood Canopy Sanctuary: Luxury Multi-Level Treehouse",
                "description": "Suspended 45 feet above ground between four ancient redwoods. Accessed via a safe suspension rope bridge, this fairytale retreat features a copper soaking tub on the open-air deck, cozy down bedding, and wraparound views of the misty forest canopy.",
                "property_type": "Treehouse",
                "city": "Santa Cruz",
                "state": "California",
                "country": "United States",
                "latitude": 36.9741,
                "longitude": -122.0308,
                "price_per_night": 390.0,
                "cleaning_fee": 90.0,
                "service_fee": 55.0,
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "baths": 1.0,
                "rating": 4.98,
                "reviews_count": 210,
                "is_superhost": True,
                "amenities": ["Fast Wifi (300+ Mbps)", "Indoor fireplace", "Hot tub / Jacuzzi", "Dedicated workspace", "Free parking on premises"],
                "images": [
                    "https://images.unsplash.com/photo-1488462237308-ecaa28b729d7?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[0],
                "category": category_map["Tiny homes"],
                "title": "The Stargazer: Off-Grid Architectural Pod in Zion",
                "description": "Minimalist luxury right at the doorstep of Zion National Park. Glass ceiling directly over the queen bed allows you to sleep under the Milky Way. Features full bathroom amenities, induction cooktop, and solar power with backup battery.",
                "property_type": "Tiny home",
                "city": "Springdale",
                "state": "Utah",
                "country": "United States",
                "latitude": 37.1889,
                "longitude": -112.9986,
                "price_per_night": 275.0,
                "cleaning_fee": 65.0,
                "service_fee": 38.0,
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "baths": 1.0,
                "rating": 4.93,
                "reviews_count": 164,
                "is_superhost": False,
                "amenities": ["Air conditioning", "Dedicated workspace", "BBQ grill & outdoor patio", "Free parking on premises"],
                "images": [
                    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[1],
                "category": category_map["Skiing"],
                "title": "Grand Alpine Lodge: Ski-In / Ski-Out Park City",
                "description": "Direct ski-in / ski-out access to the Silver Star chairlift. Featuring custom timber architecture, steam room, ski locker room with boot warmers, radiant heated floors, gourmet Wolf appliances, and private hot tub overlooking the slopes.",
                "property_type": "Entire chalet",
                "city": "Park City",
                "state": "Utah",
                "country": "United States",
                "latitude": 40.6461,
                "longitude": -111.4980,
                "price_per_night": 1120.0,
                "cleaning_fee": 220.0,
                "service_fee": 160.0,
                "max_guests": 10,
                "bedrooms": 5,
                "beds": 7,
                "baths": 4.5,
                "rating": 4.97,
                "reviews_count": 78,
                "is_superhost": True,
                "amenities": ["Ski-in / Ski-out access", "Hot tub / Jacuzzi", "Indoor fireplace", "Chef's Kitchen", "Fast Wifi (300+ Mbps)", "Free parking on premises", "Washer & Dryer"],
                "images": [
                    "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[2],
                "category": category_map["Countryside"],
                "title": "Lavender Fields Farmhouse & Carriage House",
                "description": "Immerse yourself in peace on 12 private acres of blooming lavender and apple orchards. Restored 1890s farmhouse combines historic shiplap and exposed beams with modern Scandinavian luxury and an open pasture fire pit.",
                "property_type": "Entire farmhouse",
                "city": "Hudson Valley",
                "state": "New York",
                "country": "United States",
                "latitude": 42.2529,
                "longitude": -73.7910,
                "price_per_night": 480.0,
                "cleaning_fee": 125.0,
                "service_fee": 68.0,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "baths": 2.5,
                "rating": 4.91,
                "reviews_count": 112,
                "is_superhost": True,
                "amenities": ["Indoor fireplace", "Dedicated workspace", "BBQ grill & outdoor patio", "Fast Wifi (300+ Mbps)", "Free parking on premises"],
                "images": [
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[3],
                "category": category_map["Desert"],
                "title": "Sunstone Adobe: Palm Springs Mid-Century Modern",
                "description": "Classic 1962 Alexander mid-century design fully modernized with polished concrete floors, clerestory windows, heated saltwater pool with mountain backdrop, firepit lounge, and citrus grove.",
                "property_type": "Entire house",
                "city": "Palm Springs",
                "state": "California",
                "country": "United States",
                "latitude": 33.8303,
                "longitude": -116.5453,
                "price_per_night": 540.0,
                "cleaning_fee": 140.0,
                "service_fee": 76.0,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 3,
                "baths": 2.0,
                "rating": 4.96,
                "reviews_count": 89,
                "is_superhost": True,
                "amenities": ["Private swimming pool", "Hot tub / Jacuzzi", "Air conditioning", "EV charger", "Fast Wifi (300+ Mbps)", "BBQ grill & outdoor patio"],
                "images": [
                    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[0],
                "category": category_map["Beachfront"],
                "title": "Seagrove Breeze: Modern Coastal Haven in Rosemary",
                "description": "Coastal living along the white sugary dunes of 30A. Walk 60 seconds across the wooden boardwalk directly into the emerald Gulf water. Featuring multiple wraparound balconies, private dipping pool, and complimentary cruiser bicycles.",
                "property_type": "Entire home",
                "city": "Rosemary Beach",
                "state": "Florida",
                "country": "United States",
                "latitude": 30.2796,
                "longitude": -86.0149,
                "price_per_night": 680.0,
                "cleaning_fee": 160.0,
                "service_fee": 95.0,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 5,
                "baths": 3.5,
                "rating": 4.95,
                "reviews_count": 76,
                "is_superhost": True,
                "amenities": ["Direct beach access", "Private swimming pool", "Chef's Kitchen", "Fast Wifi (300+ Mbps)", "Air conditioning", "Free parking on premises"],
                "images": [
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[1],
                "category": category_map["Cabins"],
                "title": "Smoky Ridge Lookout: Timber Lodge with Hot Tub",
                "description": "High on the crest of the Great Smoky Mountains, wake up to layers of blue ridges unfolding into the mist. Massive handcrafted log walls, outdoor stone fireplace, game room with pool table, and covered deck hot tub.",
                "property_type": "Entire cabin",
                "city": "Gatlinburg",
                "state": "Tennessee",
                "country": "United States",
                "latitude": 35.7143,
                "longitude": -83.5102,
                "price_per_night": 380.0,
                "cleaning_fee": 95.0,
                "service_fee": 54.0,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "baths": 2.5,
                "rating": 4.92,
                "reviews_count": 134,
                "is_superhost": False,
                "amenities": ["Hot tub / Jacuzzi", "Indoor fireplace", "BBQ grill & outdoor patio", "Fast Wifi (300+ Mbps)", "Free parking on premises"],
                "images": [
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[2],
                "category": category_map["Mansions"],
                "title": "Oceanfront Cliffside Estate with Private Helipad",
                "description": "One of Oahu's most iconic coastal private residences. Breathtaking cliffside infinity pool, direct tidepool access, private putting green, and master suite with floor-to-ceiling glass looking straight out into the Pacific horizon.",
                "property_type": "Entire estate",
                "city": "Honolulu",
                "state": "Hawaii",
                "country": "United States",
                "latitude": 21.3069,
                "longitude": -157.8583,
                "price_per_night": 2200.0,
                "cleaning_fee": 350.0,
                "service_fee": 310.0,
                "max_guests": 10,
                "bedrooms": 5,
                "beds": 6,
                "baths": 6.0,
                "rating": 5.0,
                "reviews_count": 41,
                "is_superhost": True,
                "amenities": ["Panoramic ocean view", "Private swimming pool", "Hot tub / Jacuzzi", "Chef's Kitchen", "Direct beach access", "EV charger", "Air conditioning"],
                "images": [
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80"
                ]
            },
            {
                "host": created_users[3],
                "category": category_map["Trending"],
                "title": "The Glass Lightbox: Modernist Hudson Valley Escape",
                "description": "Surrounded by 8 private acres of peaceful birch and maple forest, this minimalist steel-and-glass residence dissolves the boundary between indoors and wilderness. Polished concrete radiant heating, custom walnut cabinetry, and secluded cedar hot tub.",
                "property_type": "Entire home",
                "city": "Woodstock",
                "state": "New York",
                "country": "United States",
                "latitude": 42.0409,
                "longitude": -74.1182,
                "price_per_night": 510.0,
                "cleaning_fee": 130.0,
                "service_fee": 72.0,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "baths": 2.0,
                "rating": 4.97,
                "reviews_count": 88,
                "is_superhost": True,
                "amenities": ["Hot tub / Jacuzzi", "Indoor fireplace", "Fast Wifi (300+ Mbps)", "Dedicated workspace", "Free parking on premises", "Air conditioning"],
                "images": [
                    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80"
                ]
            }
        ]

        created_listings = []
        for l_data in listings_seed:
            amenity_names = l_data.pop("amenities")
            images = l_data.pop("images")
            host = l_data.pop("host")
            category = l_data.pop("category")

            listing = Listing(
                host_id=host.id,
                category_id=category.id,
                **l_data
            )
            # Add amenities
            for a_name in amenity_names:
                if a_name in amenity_map:
                    listing.amenities.append(amenity_map[a_name])
            db.add(listing)
            db.flush()

            # Add images
            for order, img_url in enumerate(images):
                img = ListingImage(
                    listing_id=listing.id,
                    image_url=img_url,
                    is_primary=(order == 0),
                    display_order=order
                )
                db.add(img)

            created_listings.append(listing)
        db.flush()

        print("Seeding Reviews...")
        reviews_data = [
            ("The photos don't even do this place justice! Waking up right above the water in Malibu was purely magical. Sarah was the most attentive host.", 5.0, 0, 4),
            ("Everything about our stay was flawless. The kitchen is fully equipped, the pool was nice and warm, and falling asleep to the ocean waves is priceless.", 5.0, 0, 5),
            ("Incredible mountain getaway. The hot tub looking out at the snow-covered pines in Aspen was the highlight of our winter trip. Will definitely rebook!", 5.0, 1, 4),
            ("The A-frame design is so cozy and photogenic. Super clean, fast wifi, and the wood fireplace heated the cabin effortlessly.", 4.9, 1, 5),
            ("An extraordinary estate for our family reunion. The vineyard views in Napa are world-class, and Elena gave us wonderful local recommendations.", 5.0, 2, 4),
            ("The mirror house in Joshua Tree was an otherworldly experience! Watching the stars from the deck was unforgettable.", 5.0, 3, 5),
            ("Stunning Lake Tahoe chalet. Direct dock access and kayaking in the morning made this our best summer trip yet.", 4.9, 4, 4),
            ("Cliffside views that take your breath away. High-end amenities and pure tranquillity in Big Sur.", 5.0, 5, 5),
            ("Pure Beverly Hills luxury. The pool and outdoor lounge felt like a 5-star boutique hotel all to ourselves.", 4.9, 6, 4),
            ("Living in this redwood treehouse was a childhood dream come true. Cozy, romantic, and truly unique.", 5.0, 7, 5)
        ]

        for text, rating, listing_idx, user_idx in reviews_data:
            rev = Review(
                listing_id=created_listings[listing_idx].id,
                user_id=created_users[user_idx].id,
                rating=rating,
                comment=text,
                created_at=datetime.now(timezone.utc) - timedelta(days=5 * (listing_idx + 1))
            )
            db.add(rev)

        print("Seeding Sample Bookings...")
        # Create a few upcoming and past bookings
        sample_bookings = [
            {
                "listing": created_listings[0],
                "user": created_users[4],
                "check_in": (datetime.now(timezone.utc) + timedelta(days=10)).strftime("%Y-%m-%d"),
                "check_out": (datetime.now(timezone.utc) + timedelta(days=14)).strftime("%Y-%m-%d"),
                "guests_count": 2,
                "total_price": 4 * 890.0 + 180.0 + 120.0,
                "status": "CONFIRMED"
            },
            {
                "listing": created_listings[1],
                "user": created_users[4],
                "check_in": (datetime.now(timezone.utc) + timedelta(days=25)).strftime("%Y-%m-%d"),
                "check_out": (datetime.now(timezone.utc) + timedelta(days=28)).strftime("%Y-%m-%d"),
                "guests_count": 2,
                "total_price": 3 * 460.0 + 110.0 + 65.0,
                "status": "CONFIRMED"
            },
            {
                "listing": created_listings[3],
                "user": created_users[5],
                "check_in": (datetime.now(timezone.utc) + timedelta(days=5)).strftime("%Y-%m-%d"),
                "check_out": (datetime.now(timezone.utc) + timedelta(days=8)).strftime("%Y-%m-%d"),
                "guests_count": 3,
                "total_price": 3 * 520.0 + 120.0 + 75.0,
                "status": "CONFIRMED"
            }
        ]

        for b in sample_bookings:
            listing_obj = b.pop("listing")
            user_obj = b.pop("user")
            booking = Booking(
                listing_id=listing_obj.id,
                user_id=user_obj.id,
                **b
            )
            db.add(booking)

        print("Seeding Sample Wishlists...")
        db.add(Wishlist(user_id=created_users[4].id, listing_id=created_listings[0].id))
        db.add(Wishlist(user_id=created_users[4].id, listing_id=created_listings[2].id))
        db.add(Wishlist(user_id=created_users[4].id, listing_id=created_listings[7].id))

        db.commit()
        print(f"Successfully seeded {len(created_listings)} listings, {len(categories_data)} categories, {len(amenities_data)} amenities, and sample bookings!")
    except Exception as e:
        db.rollback()
        print("Error during seed:", e)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
