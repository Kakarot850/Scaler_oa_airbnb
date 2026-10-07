"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ListingCard } from "@/components/ListingCard";
import { ListingSummary } from "@/types";
import { api } from "@/services/api";
import { useUser } from "@/context/UserContext";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistsPage() {
  const { currentUser } = useUser();
  const { wishlistIds } = useWishlist();
  const [savedListings, setSavedListings] = useState<ListingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlists = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const data = await api.getWishlists(currentUser.id);
      setSavedListings(data);
    } catch (err) {
      console.error("Failed to load wishlists", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlists();
  }, [currentUser?.id, wishlistIds.size]);

  return (
    <>
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 flex-1 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#222222] tracking-tight">Wishlists</h1>
          <p className="text-sm text-[#717171] mt-1">
            Saved dream destinations for <strong>{currentUser?.name || "Guest"}</strong>
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-neutral-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : savedListings.length === 0 ? (
          <div className="py-20 border border-dashed border-[#DDDDDD] rounded-3xl flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-[#FFF0F2] flex items-center justify-center text-[#FF385C] mb-4">
              <Heart className="w-8 h-8 fill-[#FF385C]" />
            </div>
            <h3 className="text-xl font-bold text-[#222222]">Create your first wishlist</h3>
            <p className="text-sm text-[#717171] mt-1 max-w-sm">
              As you search, tap the heart icon on any listing to save your favorite stays here.
            </p>
            <Link
              href="/"
              className="mt-6 px-6 py-3 bg-[#222222] hover:bg-black text-white text-sm font-semibold rounded-full shadow-md transition active:scale-95 flex items-center gap-2"
            >
              Explore places to stay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {savedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
