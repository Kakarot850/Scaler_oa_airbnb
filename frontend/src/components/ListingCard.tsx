"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { ListingSummary } from "@/types";
import { useWishlist } from "@/context/WishlistContext";

interface ListingCardProps {
  listing: ListingSummary;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { isSaved, toggleWishlist } = useWishlist();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = listing.images && listing.images.length > 0
    ? listing.images.map((img) => img.image_url)
    : ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80"];

  const saved = isSaved(listing.id);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(listing.id);
  };

  return (
    <div
      className="group relative flex flex-col cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/rooms/${listing.id}`} className="block">
        {/* Photo Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#EBEBEB]">
          <img
            src={images[currentImageIdx]}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Superhost Pill */}
          {listing.is_superhost && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-[#222222] shadow-sm">
              Superhost
            </div>
          )}

          {/* Wishlist Heart Button */}
          <button
            onClick={handleHeartClick}
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 active:scale-90 transition-transform z-10"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                saved
                  ? "fill-[#FF385C] text-[#FF385C]"
                  : "fill-black/30 text-white stroke-[2]"
              }`}
            />
          </button>

          {/* Carousel arrows */}
          {images.length > 1 && isHovered && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#222222] flex items-center justify-center shadow-md hover:scale-105 transition active:scale-95 z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#222222] flex items-center justify-center shadow-md hover:scale-105 transition active:scale-95 z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Carousel dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`block rounded-full transition-all ${
                    idx === currentImageIdx
                      ? "w-2 h-2 bg-white scale-110 shadow-sm"
                      : "w-1.5 h-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Listing Details */}
        <div className="mt-3 flex flex-col text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#222222] truncate pr-2">
              {listing.city}, {listing.state}
            </span>
            <div className="flex items-center gap-1 text-[#222222] flex-shrink-0 font-medium">
              <Star className="w-3.5 h-3.5 fill-[#222222]" />
              <span>{listing.rating.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-[#717171] text-xs truncate mt-0.5">
            {listing.property_type} · {listing.category?.name || "Vacation home"}
          </div>

          <div className="text-[#717171] text-xs mt-0.5">
            {listing.reviews_count > 0 ? `${listing.reviews_count} reviews` : "New to Airbnb"}
          </div>

          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="font-bold text-[#222222] text-base">
              ${Math.round(listing.price_per_night)}
            </span>
            <span className="text-[#717171] text-sm">night</span>
          </div>
        </div>
      </Link>
    </div>
  );
};
