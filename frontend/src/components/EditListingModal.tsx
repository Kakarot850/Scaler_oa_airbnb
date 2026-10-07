"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { ListingDetail, Category } from "@/types";
import { api } from "@/services/api";

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingDetail;
  categories: Category[];
  hostId: number;
  onListingUpdated: () => void;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  isOpen,
  onClose,
  listing,
  categories,
  hostId,
  onListingUpdated,
}) => {
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [propertyType, setPropertyType] = useState(listing.property_type);
  const [categoryId, setCategoryId] = useState<number>(listing.category_id || categories[0]?.id || 1);
  const [city, setCity] = useState(listing.city);
  const [state, setState] = useState(listing.state);
  const [pricePerNight, setPricePerNight] = useState<number>(listing.price_per_night);
  const [cleaningFee, setCleaningFee] = useState<number>(listing.cleaning_fee);
  const [serviceFee, setServiceFee] = useState<number>(listing.service_fee);
  const [maxGuests, setMaxGuests] = useState<number>(listing.max_guests);
  const [bedrooms, setBedrooms] = useState<number>(listing.bedrooms);
  const [beds, setBeds] = useState<number>(listing.beds);
  const [baths, setBaths] = useState<number>(listing.baths);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.updateListing(
        listing.id,
        {
          title: title.trim(),
          description: description.trim(),
          property_type: propertyType,
          category_id: categoryId,
          city: city.trim(),
          state: state.trim(),
          price_per_night: Number(pricePerNight),
          cleaning_fee: Number(cleaningFee),
          service_fee: Number(serviceFee),
          max_guests: Number(maxGuests),
          bedrooms: Number(bedrooms),
          beds: Number(beds),
          baths: Number(baths),
        },
        hostId
      );

      onListingUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB]">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F7F7F7] text-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-[#222222] text-lg">Edit Listing</h2>
          <div className="w-8" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
              Listing Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
              Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                Property Type
              </label>
              <input
                type="text"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                Price / Night ($)
              </label>
              <input
                type="number"
                min="1"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(Number(e.target.value))}
                className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                Cleaning Fee ($)
              </label>
              <input
                type="number"
                min="0"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(Number(e.target.value))}
                className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                Service Fee ($)
              </label>
              <input
                type="number"
                min="0"
                value={serviceFee}
                onChange={(e) => setServiceFee(Number(e.target.value))}
                className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">Max Guests</label>
              <input
                type="number"
                min="1"
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2 text-sm font-medium focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">Bedrooms</label>
              <input
                type="number"
                min="1"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2 text-sm font-medium focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">Beds</label>
              <input
                type="number"
                min="1"
                value={beds}
                onChange={(e) => setBeds(Number(e.target.value))}
                className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2 text-sm font-medium focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">Baths</label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={baths}
                onChange={(e) => setBaths(Number(e.target.value))}
                className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2 text-sm font-medium focus:border-black focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#EBEBEB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#717171] hover:bg-[#F7F7F7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#222222] hover:bg-black text-white px-7 py-2.5 rounded-xl text-sm font-semibold transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
