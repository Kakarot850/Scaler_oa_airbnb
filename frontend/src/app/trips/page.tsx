"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Luggage,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Booking } from "@/types";
import { api } from "@/services/api";
import { useUser } from "@/context/UserContext";

export default function TripsPage() {
  const { currentUser } = useUser();
  const [trips, setTrips] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchTrips = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const data = await api.getTrips(currentUser.id);
      setTrips(data);
    } catch (err) {
      console.error("Failed to load trips", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [currentUser?.id]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!currentUser) return;
    const confirm = window.confirm("Are you sure you want to cancel this reservation?");
    if (!confirm) return;

    setCancellingId(bookingId);
    try {
      await api.cancelBooking(bookingId, currentUser.id);
      await fetchTrips();
    } catch (err: any) {
      alert("Failed to cancel reservation: " + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 flex-1 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#222222] tracking-tight">Trips</h1>
          <p className="text-sm text-[#717171] mt-1">
            Reservations and upcoming adventures for <strong>{currentUser?.name || "Guest"}</strong>
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 bg-neutral-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="py-20 border border-dashed border-[#DDDDDD] rounded-3xl flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#717171] mb-4">
              <Luggage className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#222222]">No trips booked... yet!</h3>
            <p className="text-sm text-[#717171] mt-1 max-w-sm">
              Time to dust off your bags and start planning your next great getaway.
            </p>
            <Link
              href="/"
              className="mt-6 px-6 py-3 bg-[#FF385C] hover:bg-[#E00B41] text-white text-sm font-semibold rounded-full shadow-md transition active:scale-95 flex items-center gap-2"
            >
              Start searching stays <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.map((booking) => {
              const isConfirmed = booking.status === "CONFIRMED";
              const photo =
                booking.listing?.images?.[0]?.image_url ||
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600";

              return (
                <div
                  key={booking.id}
                  className="border border-[#EBEBEB] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="sm:w-48 aspect-video sm:aspect-square relative bg-[#EBEBEB] flex-shrink-0">
                      <img
                        src={photo}
                        alt={booking.listing?.title || "Property"}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm ${
                          isConfirmed
                            ? "bg-emerald-500/90 text-white"
                            : "bg-neutral-600/90 text-white"
                        }`}
                      >
                        {isConfirmed ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Confirmed
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Cancelled
                          </>
                        )}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-semibold text-[#717171] uppercase tracking-wider">
                          {booking.listing?.city}, {booking.listing?.state}
                        </span>
                        <h3 className="font-bold text-base text-[#222222] line-clamp-1 mt-0.5">
                          {booking.listing?.title}
                        </h3>

                        <div className="mt-3 space-y-1.5 text-xs text-[#717171]">
                          <div className="flex items-center gap-1.5 font-medium text-[#222222]">
                            <Calendar className="w-3.5 h-3.5 text-[#FF385C]" />
                            <span>
                              {booking.check_in} → {booking.check_out}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>{booking.guests_count} guest{booking.guests_count > 1 ? "s" : ""}</span>
                          </div>
                          <div>
                            <span>Reservation Total: </span>
                            <strong className="text-[#222222] font-bold text-sm">
                              ${booking.total_price.toFixed(2)}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-[#EBEBEB] flex items-center justify-between">
                        {booking.listing?.id ? (
                          <Link
                            href={`/rooms/${booking.listing.id}`}
                            className="text-xs font-semibold text-[#222222] hover:text-[#FF385C] flex items-center gap-1 transition underline"
                          >
                            View Property Details <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <div />
                        )}

                        {isConfirmed && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {cancellingId === booking.id ? "Cancelling..." : "Cancel stay"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
