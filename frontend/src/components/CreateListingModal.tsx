"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Home, Check } from "lucide-react";
import { Category, Amenity } from "@/types";
import { api } from "@/services/api";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  amenities: Amenity[];
  hostId: number;
  onListingCreated: () => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  categories,
  amenities,
  hostId,
  onListingCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("Entire villa");
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1);
  const [city, setCity] = useState("Malibu");
  const [state, setState] = useState("California");
  const [country, setCountry] = useState("United States");
  const [pricePerNight, setPricePerNight] = useState<number>(450);
  const [cleaningFee, setCleaningFee] = useState<number>(100);
  const [serviceFee, setServiceFee] = useState<number>(60);
  const [maxGuests, setMaxGuests] = useState<number>(4);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [beds, setBeds] = useState<number>(2);
  const [baths, setBaths] = useState<number>(2);
  const [isSuperhost, setIsSuperhost] = useState<boolean>(true);

  const [imageUrls, setImageUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=80",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([1, 2, 3, 4]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const toggleAmenity = (id: number) => {
    if (selectedAmenityIds.includes(id)) {
      setSelectedAmenityIds(selectedAmenityIds.filter((item) => item !== id));
    } else {
      setSelectedAmenityIds([...selectedAmenityIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !city.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.createListing(
        {
          title: title.trim(),
          description: description.trim(),
          property_type: propertyType,
          category_id: categoryId,
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          price_per_night: Number(pricePerNight),
          cleaning_fee: Number(cleaningFee),
          service_fee: Number(serviceFee),
          max_guests: Number(maxGuests),
          bedrooms: Number(bedrooms),
          beds: Number(beds),
          baths: Number(baths),
          is_superhost: isSuperhost,
          image_urls: imageUrls,
          amenity_ids: selectedAmenityIds,
        },
        hostId
      );

      onListingCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB]">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F7F7F7] text-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-[#222222] text-lg">Create a New Listing</h2>
          <div className="w-8" />
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Basic Details */}
          <div>
            <h3 className="font-bold text-[#222222] text-sm uppercase tracking-wider mb-3">
              1. General Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                  Listing Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Cliffside Villa with Ocean Views"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe what makes your space special, views, and unique amenities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none bg-white"
                  >
                    <option value="Entire villa">Entire villa</option>
                    <option value="Entire cabin">Entire cabin</option>
                    <option value="Entire estate">Entire estate</option>
                    <option value="Entire home">Entire home</option>
                    <option value="Entire chalet">Entire chalet</option>
                    <option value="Treehouse">Treehouse</option>
                    <option value="Tiny home">Tiny home</option>
                    <option value="Entire farmhouse">Entire farmhouse</option>
                  </select>
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
            </div>
          </div>

          <hr className="border-[#EBEBEB]" />

          {/* Location */}
          <div>
            <h3 className="font-bold text-[#222222] text-sm uppercase tracking-wider mb-3">
              2. Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                  State / Region *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#EBEBEB]" />

          {/* Pricing & Capacity */}
          <div>
            <h3 className="font-bold text-[#222222] text-sm uppercase tracking-wider mb-3">
              3. Pricing & Capacity
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                  Price / Night ($)
                </label>
                <input
                  type="number"
                  min="1"
                  required
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
                <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                  Max Guests
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(Number(e.target.value))}
                  className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2 text-sm font-medium focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min="1"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2 text-sm font-medium focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                  Beds
                </label>
                <input
                  type="number"
                  min="1"
                  value={beds}
                  onChange={(e) => setBeds(Number(e.target.value))}
                  className="w-full border border-[#DDDDDD] rounded-xl px-3 py-2 text-sm font-medium focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#717171] uppercase mb-1">
                  Baths
                </label>
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
          </div>

          <hr className="border-[#EBEBEB]" />

          {/* Amenities */}
          <div>
            <h3 className="font-bold text-[#222222] text-sm uppercase tracking-wider mb-3">
              4. Amenities Offered
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {amenities.map((a) => {
                const checked = selectedAmenityIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAmenity(a.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition ${
                      checked
                        ? "border-[#222222] bg-[#F7F7F7] font-semibold text-[#222222]"
                        : "border-[#EBEBEB] text-[#717171] hover:border-[#DDDDDD]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        checked ? "bg-[#222222] border-[#222222] text-white" : "border-[#DDDDDD]"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3" />}
                    </div>
                    <span className="truncate">{a.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-[#EBEBEB]" />

          {/* Photos */}
          <div>
            <h3 className="font-bold text-[#222222] text-sm uppercase tracking-wider mb-3">
              5. Listing Photos (Unsplash or URL)
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                placeholder="Paste image URL (e.g. Unsplash photo URL)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-[#222222] hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-[#DDDDDD] group">
                  <img src={url} alt={`Listing photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-semibold">
                      Cover Photo
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
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
              className="bg-[#FF385C] hover:bg-[#E00B41] text-white px-7 py-2.5 rounded-xl text-sm font-semibold transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Publishing..." : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
