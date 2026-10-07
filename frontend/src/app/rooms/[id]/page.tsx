"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Heart,
  Share2,
  ChevronLeft,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Grid,
  CheckCircle,
  MessageSquare,
  Clock,
  ArrowRight,
  Info,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ReserveModal } from "@/components/ReserveModal";
import { ListingDetail, DateRange } from "@/types";
import { api } from "@/services/api";
import { useUser } from "@/context/UserContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = Number(params?.id);

  const { currentUser } = useUser();
  const { isSaved, toggleWishlist } = useWishlist();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [bookedRanges, setBookedRanges] = useState<DateRange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reservation form state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fiveDaysLater = new Date();
  fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);

  const [checkIn, setCheckIn] = useState<string>(tomorrow.toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState<string>(fiveDaysLater.toISOString().split("T")[0]);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [dateConflictError, setDateConflictError] = useState<string | null>(null);

  // Review submission state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Lightbox view for all photos
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // Share copied alert
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    async function loadListing() {
      if (!listingId) return;
      setIsLoading(true);
      try {
        const data = await api.getListing(listingId, currentUser?.id);
        setListing(data);

        // Load booked availability dates
        const avail = await api.getListingAvailability(listingId);
        setBookedRanges(avail.booked_ranges);
      } catch (err: any) {
        setError(err.message || "Failed to load listing details");
      } finally {
        setIsLoading(false);
      }
    }
    loadListing();
  }, [listingId, currentUser?.id]);

  // Calculate pricing breakdown
  const calculatePricing = () => {
    if (!listing || !checkIn || !checkOut) {
      return { nights: 0, subtotal: 0, cleaningFee: 0, serviceFee: 0, totalPrice: 0 };
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const subtotal = nights * listing.price_per_night;
    const cleaningFee = listing.cleaning_fee;
    const serviceFee = listing.service_fee;
    const totalPrice = subtotal + cleaningFee + serviceFee;

    return { nights, subtotal, cleaningFee, serviceFee, totalPrice };
  };

  const pricing = calculatePricing();

  // Validate chosen dates against booked ranges
  const checkDateConflict = (ci: string, co: string): boolean => {
    for (const range of bookedRanges) {
      // Overlap: ci < range.check_out && co > range.check_in
      if (ci < range.check_out && co > range.check_in) {
        return true;
      }
    }
    return false;
  };

  const handleDatesChange = (newCheckIn: string, newCheckOut: string) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);

    if (newCheckIn && newCheckOut) {
      if (newCheckOut <= newCheckIn) {
        setDateConflictError("Check-out date must be after check-in date.");
        return;
      }
      const hasConflict = checkDateConflict(newCheckIn, newCheckOut);
      if (hasConflict) {
        setDateConflictError("Selected dates conflict with an existing reservation. Please choose available dates.");
      } else {
        setDateConflictError(null);
      }
    }
  };

  const handleOpenReserve = () => {
    if (!checkIn || !checkOut) {
      setDateConflictError("Please select check-in and check-out dates.");
      return;
    }
    if (checkOut <= checkIn) {
      setDateConflictError("Check-out date must be after check-in date.");
      return;
    }
    if (checkDateConflict(checkIn, checkOut)) {
      setDateConflictError("Selected dates are already booked. Please choose other dates.");
      return;
    }
    setDateConflictError(null);
    setIsReserveModalOpen(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing || !currentUser || !newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const added = await api.addReview(listing.id, {
        user_id: currentUser.id,
        rating: Number(newRating),
        comment: newComment.trim(),
      });
      // Update local reviews list
      setListing({
        ...listing,
        reviews: [added, ...listing.reviews],
        reviews_count: listing.reviews_count + 1,
      });
      setNewComment("");
      setNewRating(5);
    } catch (err: any) {
      alert("Failed to submit review: " + err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/2" />
          <div className="h-4 bg-neutral-200 rounded w-1/4" />
          <div className="aspect-[2/1] bg-neutral-200 rounded-3xl" />
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-4">
              <div className="h-6 bg-neutral-200 rounded w-1/3" />
              <div className="h-20 bg-neutral-200 rounded" />
            </div>
            <div className="h-72 bg-neutral-200 rounded-2xl" />
          </div>
        </main>
      </>
    );
  }

  if (error || !listing) {
    return (
      <>
        <Navbar />
        <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-20 text-center">
          <h2 className="text-2xl font-bold text-[#222222]">Listing Not Found</h2>
          <p className="text-sm text-[#717171] mt-2">{error || "The requested listing does not exist."}</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF385C] text-white rounded-full font-semibold text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Listings
          </Link>
        </main>
      </>
    );
  }

  const images = listing.images && listing.images.length > 0
    ? listing.images.map((img) => img.image_url)
    : [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      ];

  const saved = isSaved(listing.id);

  return (
    <>
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 w-full">
        {/* Breadcrumb / Back button */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#717171] hover:text-[#222222] transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to explore stays
          </Link>
        </div>

        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] tracking-tight">
              {listing.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#717171] mt-2 font-medium">
              <span className="flex items-center gap-1 text-[#222222] font-semibold">
                <Star className="w-4 h-4 fill-[#222222]" /> {listing.rating.toFixed(2)}
              </span>
              <span>·</span>
              <span className="underline cursor-pointer">{listing.reviews_count} reviews</span>
              {listing.is_superhost && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[#222222] font-semibold">
                    <Award className="w-4 h-4 text-[#FF385C]" /> Superhost
                  </span>
                </>
              )}
              <span>·</span>
              <span className="underline cursor-pointer">
                {listing.city}, {listing.state}, {listing.country}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold text-[#222222]">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 hover:bg-[#F7F7F7] px-3 py-1.5 rounded-lg transition underline"
            >
              <Share2 className="w-4 h-4" />
              <span>{shareCopied ? "Link Copied!" : "Share"}</span>
            </button>
            <button
              onClick={() => toggleWishlist(listing.id)}
              className="flex items-center gap-2 hover:bg-[#F7F7F7] px-3 py-1.5 rounded-lg transition underline"
            >
              <Heart
                className={`w-4 h-4 ${
                  saved ? "fill-[#FF385C] text-[#FF385C]" : "text-[#222222]"
                }`}
              />
              <span>{saved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>

        {/* 5-Photo Grid Layout */}
        <div className="relative rounded-2xl overflow-hidden mb-8 grid grid-cols-1 md:grid-cols-4 gap-2 aspect-[16/10] sm:aspect-[2/1] max-h-[480px]">
          {/* Main Hero Photo (2x2 span) */}
          <div className="md:col-span-2 h-full overflow-hidden group cursor-pointer relative">
            <img
              src={images[0]}
              alt={listing.title}
              onClick={() => setShowAllPhotos(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* 4 Sub-Photos */}
          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2 h-full">
            {images.slice(1, 5).map((imgUrl, idx) => (
              <div
                key={idx}
                className="overflow-hidden group cursor-pointer relative h-full"
                onClick={() => setShowAllPhotos(true)}
              >
                <img
                  src={imgUrl}
                  alt={`${listing.title} photo ${idx + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* "Show all photos" floating pill */}
          <button
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-[#222222] font-semibold text-xs px-3.5 py-2 rounded-lg shadow-md border border-[#DDDDDD] flex items-center gap-2 transition hover:scale-105 active:scale-95"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Show all {images.length} photos</span>
          </button>
        </div>

        {/* Main Content Layout: Left Specs + Right Sticky Reservation Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative items-start">
          {/* Left Column (Property Details) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host overview */}
            <div className="flex items-center justify-between pb-6 border-b border-[#EBEBEB]">
              <div>
                <h2 className="text-xl font-bold text-[#222222]">
                  {listing.property_type} hosted by {listing.host?.name || "Host"}
                </h2>
                <div className="text-sm text-[#717171] mt-1 flex flex-wrap items-center gap-2">
                  <span>{listing.max_guests} guests</span>
                  <span>·</span>
                  <span>{listing.bedrooms} bedroom{listing.bedrooms > 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{listing.beds} bed{listing.beds > 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{listing.baths} bath{listing.baths > 1 ? "s" : ""}</span>
                </div>
              </div>

              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                <img
                  src={
                    listing.host?.avatar_url ||
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200"
                  }
                  alt={listing.host?.name || "Host"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-5 pb-6 border-b border-[#EBEBEB]">
              {listing.is_superhost && (
                <div className="flex items-start gap-4">
                  <Award className="w-6 h-6 text-[#FF385C] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[#222222]">
                      {listing.host?.name} is a Superhost
                    </h3>
                    <p className="text-xs text-[#717171] mt-0.5">
                      Superhosts are experienced, highly rated hosts committed to providing great stays for guests.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-[#222222] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#222222]">Prime Scenic Location</h3>
                  <p className="text-xs text-[#717171] mt-0.5">
                    95% of recent guests gave the location a 5-star rating.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Calendar className="w-6 h-6 text-[#222222] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#222222]">Free Cancellation</h3>
                  <p className="text-xs text-[#717171] mt-0.5">
                    Cancel before check-in for a full refund.
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-[#EBEBEB]">
              <h3 className="text-lg font-bold text-[#222222] mb-3">About this space</h3>
              <p className="text-sm text-[#222222] leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Sleeping arrangements */}
            <div className="pb-6 border-b border-[#EBEBEB]">
              <h3 className="text-lg font-bold text-[#222222] mb-4">Where you'll sleep</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: listing.bedrooms }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border border-[#DDDDDD] flex flex-col justify-between"
                  >
                    <div className="text-xs font-semibold text-[#717171] uppercase">Bedroom {i + 1}</div>
                    <div className="mt-3 font-bold text-sm text-[#222222]">1 King or Queen bed</div>
                    <div className="text-xs text-[#717171] mt-0.5">Luxury linens provided</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="pb-6 border-b border-[#EBEBEB]">
              <h3 className="text-lg font-bold text-[#222222] mb-4">What this place offers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listing.amenities && listing.amenities.length > 0 ? (
                  listing.amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-3 text-sm text-[#222222]">
                      <CategoryIcon name={amenity.icon_name} className="w-5 h-5 text-[#222222]" />
                      <span>{amenity.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#717171]">Wifi, Kitchen, Hot tub, Free parking included.</p>
                )}
              </div>
            </div>

            {/* Booked Dates Notice */}
            {bookedRanges.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800">
                <span className="font-bold">Reserved Date Ranges (Unavailable): </span>
                {bookedRanges.map((r, i) => (
                  <span key={i} className="inline-block bg-white px-2 py-0.5 rounded border border-amber-300 ml-1.5 mt-1">
                    {r.check_in} to {r.check_out}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (Sticky Desktop Reservation Sidebar) */}
          <div className="lg:col-span-1 sticky top-28">
            <div className="border border-[#DDDDDD] rounded-3xl p-6 shadow-xl bg-white space-y-4">
              {/* Price & Rating Header */}
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#222222]">
                    ${Math.round(listing.price_per_night)}
                  </span>
                  <span className="text-[#717171] text-sm">night</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#222222]">
                  <Star className="w-3.5 h-3.5 fill-[#222222]" />
                  <span>{listing.rating.toFixed(2)}</span>
                  <span className="text-[#717171]">({listing.reviews_count})</span>
                </div>
              </div>

              {/* Date & Guest Picker Box */}
              <div className="border border-[#B0B0B0] rounded-2xl overflow-hidden divide-y divide-[#DDDDDD]">
                {/* Dates row */}
                <div className="grid grid-cols-2 divide-x divide-[#DDDDDD]">
                  <div className="p-2.5">
                    <label className="block text-[10px] font-bold text-[#222222] uppercase tracking-wider">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => handleDatesChange(e.target.value, checkOut)}
                      className="w-full text-xs font-semibold focus:outline-none bg-transparent mt-0.5"
                    />
                  </div>
                  <div className="p-2.5">
                    <label className="block text-[10px] font-bold text-[#222222] uppercase tracking-wider">
                      Checkout
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => handleDatesChange(checkIn, e.target.value)}
                      className="w-full text-xs font-semibold focus:outline-none bg-transparent mt-0.5"
                    />
                  </div>
                </div>

                {/* Guests dropdown */}
                <div className="p-2.5 flex items-center justify-between">
                  <div>
                    <label className="block text-[10px] font-bold text-[#222222] uppercase tracking-wider">
                      Guests
                    </label>
                    <div className="text-xs font-semibold text-[#222222] mt-0.5">
                      {guestsCount} guest{guestsCount > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                      disabled={guestsCount <= 1}
                      className="w-6 h-6 rounded-full border border-[#DDDDDD] flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:border-black"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold w-3 text-center">{guestsCount}</span>
                    <button
                      onClick={() => setGuestsCount(Math.min(listing.max_guests, guestsCount + 1))}
                      disabled={guestsCount >= listing.max_guests}
                      className="w-6 h-6 rounded-full border border-[#DDDDDD] flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:border-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Date Collision Warning */}
              {dateConflictError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{dateConflictError}</span>
                </div>
              )}

              {/* Reserve CTA Button */}
              <button
                onClick={handleOpenReserve}
                className="w-full bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold py-3.5 rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 text-base"
              >
                Reserve
              </button>
              <p className="text-center text-xs text-[#717171]">You won't be charged yet</p>

              {/* Subtotal breakdown */}
              <div className="space-y-3 pt-2 text-sm text-[#222222]">
                <div className="flex justify-between">
                  <span className="underline">
                    ${Math.round(listing.price_per_night)} × {pricing.nights} night{pricing.nights > 1 ? "s" : ""}
                  </span>
                  <span>${pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Cleaning fee</span>
                  <span>${pricing.cleaningFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Airbnb service fee</span>
                  <span>${pricing.serviceFee.toFixed(2)}</span>
                </div>

                <hr className="border-[#EBEBEB]" />

                <div className="flex justify-between font-bold text-base pt-1">
                  <span>Total before taxes</span>
                  <span>${pricing.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-16 pt-10 border-t border-[#EBEBEB]">
          <div className="flex items-center gap-2 text-xl font-bold text-[#222222] mb-6">
            <Star className="w-5 h-5 fill-[#222222]" />
            <span>{listing.rating.toFixed(2)}</span>
            <span>·</span>
            <span>{listing.reviews_count} reviews</span>
          </div>

          {/* Overall rating bars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-[#F7F7F7]">
              <span className="text-xs text-[#717171]">Cleanliness</span>
              <p className="font-bold text-lg text-[#222222] mt-1">4.9 / 5.0</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F7F7]">
              <span className="text-xs text-[#717171]">Accuracy</span>
              <p className="font-bold text-lg text-[#222222] mt-1">5.0 / 5.0</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F7F7]">
              <span className="text-xs text-[#717171]">Communication</span>
              <p className="font-bold text-lg text-[#222222] mt-1">5.0 / 5.0</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F7F7]">
              <span className="text-xs text-[#717171]">Location</span>
              <p className="font-bold text-lg text-[#222222] mt-1">4.9 / 5.0</p>
            </div>
          </div>

          {/* Past reviews grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {listing.reviews && listing.reviews.length > 0 ? (
              listing.reviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl border border-[#EBEBEB] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#717171] text-white flex items-center justify-center font-bold text-xs">
                      {rev.user?.avatar_url ? (
                        <img src={rev.user.avatar_url} alt={rev.user.name} className="w-full h-full object-cover" />
                      ) : (
                        rev.user?.name?.charAt(0) || "G"
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#222222]">{rev.user?.name || "Guest"}</h4>
                      <p className="text-xs text-[#717171]">
                        {new Date(rev.created_at).toLocaleDateString(undefined, {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#222222]">
                    <Star className="w-3.5 h-3.5 fill-[#222222]" />
                    <span>{rev.rating.toFixed(1)} rating</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#222222] leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#717171]">No reviews yet. Be the first to leave a review!</p>
            )}
          </div>

          {/* Leave a review form */}
          <div className="p-6 rounded-3xl bg-[#F7F7F7] border border-[#EBEBEB] max-w-xl">
            <h4 className="font-bold text-base text-[#222222] mb-1">Leave a Review</h4>
            <p className="text-xs text-[#717171] mb-4">
              Share your feedback as {currentUser?.name || "Guest"}
            </p>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating ? "fill-amber-400 text-amber-400" : "text-neutral-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-[#222222] ml-2">{newRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                  Your Comment
                </label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="How was your stay? Did you enjoy the views and amenities?"
                  className="w-full border border-[#DDDDDD] rounded-xl p-3 text-sm font-medium focus:border-black focus:outline-none bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="bg-[#222222] hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-semibold transition active:scale-95 disabled:opacity-50"
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Reservation Checkout Modal */}
      <ReserveModal
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
        listing={listing}
        checkIn={checkIn}
        checkOut={checkOut}
        guestsCount={guestsCount}
        nights={pricing.nights}
        subtotal={pricing.subtotal}
        cleaningFee={pricing.cleaningFee}
        serviceFee={pricing.serviceFee}
        totalPrice={pricing.totalPrice}
      />

      {/* All Photos Lightbox Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="max-w-4xl mx-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm py-4 mb-6 flex items-center justify-between border-b border-[#EBEBEB]">
              <button
                onClick={() => setShowAllPhotos(false)}
                className="flex items-center gap-2 text-sm font-semibold text-[#222222] hover:underline"
              >
                <ChevronLeft className="w-4 h-4" /> Close Photos
              </button>
              <span className="text-sm font-semibold text-[#717171]">
                {images.length} photos of {listing.title}
              </span>
            </div>

            <div className="space-y-6">
              {images.map((url, i) => (
                <div key={i} className="rounded-2xl overflow-hidden shadow-lg bg-[#EBEBEB]">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
