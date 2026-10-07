"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Category } from "@/types";
import { CategoryIcon } from "./CategoryIcon";

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  onOpenFilters: () => void;
  hasActiveFilters?: boolean;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenFilters,
  hasActiveFilters = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-[#EBEBEB] py-3">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center gap-4">
        {/* Categories container with scroll buttons */}
        <div className="relative flex-1 flex items-center overflow-hidden">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 z-10 w-8 h-8 rounded-full bg-white border border-[#DDDDDD] shadow-md flex items-center justify-center hover:scale-105 transition"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-[#222222]" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
          >
            {/* "All" category option */}
            <button
              onClick={() => onSelectCategory("all")}
              className={`flex flex-col items-center gap-2 pb-2 border-b-2 flex-shrink-0 transition-all ${
                selectedCategory.toLowerCase() === "all" || !selectedCategory
                  ? "border-[#222222] text-[#222222] font-semibold opacity-100"
                  : "border-transparent text-[#717171] hover:text-[#222222] hover:border-[#DDDDDD] opacity-70 hover:opacity-100 font-medium"
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <CategoryIcon name="sparkles" className="w-5 h-5" />
              </div>
              <span className="text-xs whitespace-nowrap">All Homes</span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.name)}
                  className={`flex flex-col items-center gap-2 pb-2 border-b-2 flex-shrink-0 transition-all ${
                    isSelected
                      ? "border-[#222222] text-[#222222] font-semibold opacity-100"
                      : "border-transparent text-[#717171] hover:text-[#222222] hover:border-[#DDDDDD] opacity-70 hover:opacity-100 font-medium"
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <CategoryIcon name={cat.name} className="w-5 h-5" />
                  </div>
                  <span className="text-xs whitespace-nowrap">{cat.name}</span>
                </button>
              );
            })}
          </div>

          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 z-10 w-8 h-8 rounded-full bg-white border border-[#DDDDDD] shadow-md flex items-center justify-center hover:scale-105 transition"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-[#222222]" />
            </button>
          )}
        </div>

        {/* Filters button */}
        <button
          onClick={onOpenFilters}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold hover:border-black transition flex-shrink-0 shadow-sm ${
            hasActiveFilters
              ? "border-[#222222] bg-[#F7F7F7] text-[#222222]"
              : "border-[#DDDDDD] text-[#222222]"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[#FF385C]" />
          )}
        </button>
      </div>
    </div>
  );
};
