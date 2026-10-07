"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { min_price?: number; max_price?: number; property_type?: string }) => void;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  currentPropertyType?: string;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentMinPrice,
  currentMaxPrice,
  currentPropertyType,
}) => {
  const [minPrice, setMinPrice] = useState<string>(
    currentMinPrice !== undefined ? String(currentMinPrice) : ""
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    currentMaxPrice !== undefined ? String(currentMaxPrice) : ""
  );
  const [propertyType, setPropertyType] = useState<string>(currentPropertyType || "Any");

  if (!isOpen) return null;

  const propertyTypes = [
    "Any",
    "Entire villa",
    "Entire cabin",
    "Entire estate",
    "Entire home",
    "Entire chalet",
    "Treehouse",
    "Tiny home",
    "Entire farmhouse",
  ];

  const handleApply = () => {
    onApply({
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      property_type: propertyType === "Any" ? undefined : propertyType,
    });
    onClose();
  };

  const handleClear = () => {
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("Any");
    onApply({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB]">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F7F7F7] text-[#222222] transition"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="font-bold text-[#222222] text-base">Filters</h2>
          <div className="w-8" />
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Price Range Section */}
          <div>
            <h3 className="font-bold text-[#222222] text-lg mb-1">Price range</h3>
            <p className="text-xs text-[#717171] mb-4">Nightly prices before taxes and fees</p>

            <div className="flex items-center gap-4">
              <div className="flex-1 border border-[#DDDDDD] rounded-2xl p-3 focus-within:border-black transition">
                <label className="block text-[11px] font-semibold text-[#717171] uppercase">
                  Minimum
                </label>
                <div className="flex items-center mt-1">
                  <span className="text-sm font-semibold mr-1 text-[#222222]">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full text-sm font-semibold text-[#222222] focus:outline-none"
                  />
                </div>
              </div>

              <span className="text-[#717171] font-bold">-</span>

              <div className="flex-1 border border-[#DDDDDD] rounded-2xl p-3 focus-within:border-black transition">
                <label className="block text-[11px] font-semibold text-[#717171] uppercase">
                  Maximum
                </label>
                <div className="flex items-center mt-1">
                  <span className="text-sm font-semibold mr-1 text-[#222222]">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="2500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full text-sm font-semibold text-[#222222] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-[#EBEBEB]" />

          {/* Property Type Section */}
          <div>
            <h3 className="font-bold text-[#222222] text-lg mb-1">Property type</h3>
            <p className="text-xs text-[#717171] mb-4">Choose the style of place you want to stay in</p>

            <div className="flex flex-wrap gap-2.5">
              {propertyTypes.map((type) => {
                const isSelected = propertyType.toLowerCase() === type.toLowerCase();
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(type)}
                    className={`px-4 py-2.5 rounded-full text-xs font-semibold border transition ${
                      isSelected
                        ? "border-[#222222] bg-[#222222] text-white"
                        : "border-[#DDDDDD] text-[#222222] hover:border-[#222222] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EBEBEB] flex items-center justify-between bg-white">
          <button
            onClick={handleClear}
            className="text-sm font-semibold text-[#222222] underline hover:text-[#717171]"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="bg-[#222222] hover:bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold transition active:scale-95 shadow-md"
          >
            Show listings
          </button>
        </div>
      </div>
    </div>
  );
};
