"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ShieldCheck, CreditCard, Lock, Calendar, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { ListingDetail } from "@/types";
import { useUser } from "@/context/UserContext";
import { api } from "@/services/api";

interface ReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingDetail;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({
  isOpen,
  onClose,
  listing,
  checkIn,
  checkOut,
  guestsCount,
  nights,
  subtotal,
  cleaningFee,
  serviceFee,
  totalPrice,
}) => {
  const router = useRouter();
  const { currentUser } = useUser();

  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [cardholderName, setCardholderName] = useState(currentUser?.name || "Chloe Bennett");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMessage("Please ensure you are logged in as a guest.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await api.createBooking({
        listing_id: listing.id,
        user_id: currentUser.id,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guestsCount,
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        router.push("/trips");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to confirm reservation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB]">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F7F7F7] text-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-[#222222] text-lg">Confirm and pay</h2>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Reservation Conflict</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-[#222222]">Reservation Confirmed!</h3>
              <p className="text-[#717171] mt-2 text-sm max-w-md">
                Your stay at <strong>{listing.title}</strong> is booked. Redirecting you to your trips page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleConfirmReservation} className="space-y-6">
              {/* Listing Overview Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB]">
                <img
                  src={
                    listing.images?.[0]?.image_url ||
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300"
                  }
                  alt={listing.title}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <span className="text-xs font-semibold text-[#717171] uppercase tracking-wider">
                    {listing.property_type} in {listing.city}
                  </span>
                  <h4 className="font-bold text-[#222222] text-sm truncate mt-0.5">
                    {listing.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#717171]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {checkIn} - {checkOut} ({nights} nights)
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {guestsCount} guest{guestsCount > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="border border-[#EBEBEB] rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-[#222222] text-sm">Price details</h4>
                <div className="flex justify-between text-sm text-[#222222]">
                  <span>${Math.round(listing.price_per_night)} × {nights} nights</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#222222]">
                  <span>Cleaning fee</span>
                  <span>${cleaningFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#222222]">
                  <span>Airbnb service fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <hr className="border-[#EBEBEB]" />
                <div className="flex justify-between text-base font-bold text-[#222222]">
                  <span>Total (USD)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Section (Mocked) */}
              <div className="border border-[#EBEBEB] rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#222222]" />
                    <h4 className="font-bold text-[#222222] text-sm">Pay with Credit Card</h4>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Test Mode Auto-filled
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full border border-[#DDDDDD] rounded-xl px-3.5 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                        Expiration
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full border border-[#DDDDDD] rounded-xl px-3.5 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="text"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        className="w-full border border-[#DDDDDD] rounded-xl px-3.5 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="w-full border border-[#DDDDDD] rounded-xl px-3.5 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Ground Rules & Cancellation policy note */}
              <div className="flex items-start gap-3 p-3 bg-[#F7F7F7] rounded-xl text-xs text-[#717171]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>
                  Free cancellation before check-in. By selecting the button below, you agree to the Host's House Rules and Airbnb's Rebooking and Refund Policy.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold py-3.5 px-6 rounded-xl text-base shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing reservation...</span>
                  </>
                ) : (
                  <span>Confirm and pay · ${totalPrice.toFixed(2)}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
