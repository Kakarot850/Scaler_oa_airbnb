"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CategoryBar } from "@/components/CategoryBar";
import { ListingCard } from "@/components/ListingCard";
import { FilterModal } from "@/components/FilterModal";
import { ListingSummary, Category, SearchFilters } from "@/types";
import { api } from "@/services/api";
import { useUser } from "@/context/UserContext";
import { RotateCcw, Search, Sparkles } from "lucide-react";

function HomeContent() {
  const searchParams = useSearchParams();
  const { currentUser } = useUser();

  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [propertyType, setPropertyType] = useState<string | undefined>(undefined);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Sync category or query from URL search params
  const locationParam = searchParams.get("location") || undefined;
  const checkInParam = searchParams.get("check_in") || undefined;
  const checkOutParam = searchParams.get("check_out") || undefined;
  const guestsParam = searchParams.get("guests") ? Number(searchParams.get("guests")) : undefined;

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch listings whenever filters change
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const filters: SearchFilters = {
        category: selectedCategory === "all" ? undefined : selectedCategory,
        location: locationParam,
        check_in: checkInParam,
        check_out: checkOutParam,
        guests: guestsParam,
        min_price: minPrice,
        max_price: maxPrice,
        property_type: propertyType,
      };
      const data = await api.getListings(filters, currentUser?.id);
      setListings(data);
    } catch (err) {
      console.error("Failed to fetch listings", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [
    selectedCategory,
    locationParam,
    checkInParam,
    checkOutParam,
    guestsParam,
    minPrice,
    maxPrice,
    propertyType,
    currentUser?.id,
  ]);

  const handleApplyFilters = (newFilters: {
    min_price?: number;
    max_price?: number;
    property_type?: string;
  }) => {
    setMinPrice(newFilters.min_price);
    setMaxPrice(newFilters.max_price);
    setPropertyType(newFilters.property_type);
  };

  const hasActiveFilters =
    minPrice !== undefined ||
    maxPrice !== undefined ||
    (propertyType !== undefined && propertyType !== "Any");

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPropertyType(undefined);
  };

  return (
    <>
      <Navbar />

      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenFilters={() => setIsFilterModalOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 flex-1 w-full">
        {/* Active search filter banner */}
        {(locationParam || checkInParam || checkOutParam || guestsParam || hasActiveFilters) && (
          <div className="mb-6 p-3.5 bg-[#F7F7F7] border border-[#EBEBEB] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#222222]">
              <Search className="w-4 h-4 text-[#FF385C]" />
              <span className="font-semibold">Showing filtered stays:</span>
              {locationParam && <span className="bg-white px-2 py-1 rounded-md border border-[#DDDDDD]">{locationParam}</span>}
              {checkInParam && checkOutParam && (
                <span className="bg-white px-2 py-1 rounded-md border border-[#DDDDDD]">
                  {checkInParam} to {checkOutParam}
                </span>
              )}
              {guestsParam && <span className="bg-white px-2 py-1 rounded-md border border-[#DDDDDD]">{guestsParam} guests</span>}
              {minPrice && <span className="bg-white px-2 py-1 rounded-md border border-[#DDDDDD]">From ${minPrice}</span>}
              {maxPrice && <span className="bg-white px-2 py-1 rounded-md border border-[#DDDDDD]">Up to ${maxPrice}</span>}
              {propertyType && <span className="bg-white px-2 py-1 rounded-md border border-[#DDDDDD]">{propertyType}</span>}
            </div>

            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-[#FF385C] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Listings Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-square bg-neutral-200 rounded-2xl w-full" />
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
                <div className="h-4 bg-neutral-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFF0F2] text-[#FF385C] flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#222222]">No listings found</h3>
            <p className="text-sm text-[#717171] mt-1.5 max-w-md">
              Try adjusting your search criteria, widening the price range, or clearing current date filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-6 px-6 py-2.5 rounded-full bg-[#222222] text-white text-xs font-semibold hover:bg-black transition active:scale-95"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        currentMinPrice={minPrice}
        currentMaxPrice={maxPrice}
        currentPropertyType={propertyType}
      />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#717171]">Loading Airbnb...</div>}>
      <HomeContent />
    </Suspense>
  );
}
