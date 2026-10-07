"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Globe,
  Menu,
  User as UserIcon,
  X,
  Compass,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  Heart,
  Luggage,
  LayoutDashboard,
  RotateCcw,
  Check,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { api } from "@/services/api";

interface NavbarProps {
  onSearchChange?: (params: { location?: string; check_in?: string; check_out?: string; guests?: number }) => void;
}

const NavbarContent: React.FC<NavbarProps> = ({ onSearchChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, users, isHostMode, toggleHostMode, switchUser } = useUser();

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);
  const [reseedSuccess, setReseedSuccess] = useState(false);

  // Search state
  const [activeTab, setActiveTab] = useState<"where" | "when" | "who">("where");
  const [locationInput, setLocationInput] = useState(searchParams.get("location") || "");
  const [checkInInput, setCheckInInput] = useState(searchParams.get("check_in") || "");
  const [checkOutInput, setCheckOutInput] = useState(searchParams.get("check_out") || "");
  const [guestsCount, setGuestsCount] = useState(Number(searchParams.get("guests")) || 1);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (
        isSearchExpanded &&
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchExpanded]);

  const handleSearchSubmit = () => {
    setIsSearchExpanded(false);
    const params = new URLSearchParams();
    if (locationInput.trim()) params.append("location", locationInput.trim());
    if (checkInInput) params.append("check_in", checkInInput);
    if (checkOutInput) params.append("check_out", checkOutInput);
    if (guestsCount > 1) params.append("guests", String(guestsCount));

    const queryStr = params.toString();
    router.push(`/?${queryStr}`);

    if (onSearchChange) {
      onSearchChange({
        location: locationInput.trim() || undefined,
        check_in: checkInInput || undefined,
        check_out: checkOutInput || undefined,
        guests: guestsCount > 1 ? guestsCount : undefined,
      });
    }
  };

  const clearSearch = () => {
    setLocationInput("");
    setCheckInInput("");
    setCheckOutInput("");
    setGuestsCount(1);
    router.push("/");
    if (onSearchChange) {
      onSearchChange({});
    }
  };

  const handleReseed = async () => {
    setIsReseeding(true);
    try {
      await api.seedDatabase();
      setReseedSuccess(true);
      setTimeout(() => {
        setReseedSuccess(false);
        setIsUserMenuOpen(false);
        window.location.reload();
      }, 1200);
    } catch (err) {
      alert("Failed to reseed database: " + err);
    } finally {
      setIsReseeding(false);
    }
  };

  const popularDestinations = [
    { name: "Malibu, California", desc: "Oceanfront luxury" },
    { name: "Aspen, Colorado", desc: "Alpine lodges & pines" },
    { name: "Napa Valley, California", desc: "Vineyards & estates" },
    { name: "Joshua Tree, California", desc: "Desert architectural wonder" },
    { name: "Lake Tahoe, Nevada", desc: "Emerald waters & chalets" },
    { name: "Big Sur, California", desc: "Dramatic ocean cliffs" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#EBEBEB] transition-all duration-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-10 h-10 rounded-full bg-[#FF385C] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <svg
              className="w-6 h-6 fill-current"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.44 7.1 14.549 1.513 3.242 1.622 6.012.302 8.361-1.353 2.409-3.845 3.796-6.84 3.796-2.585 0-5.06-1.077-7.846-3.415-2.786 2.338-5.261 3.415-7.846 3.415-2.995 0-5.487-1.387-6.84-3.796-1.32-2.349-1.211-5.119.302-8.361.986-2.109 5.146-10.719 7.1-14.549l.533-1.025C8.537 1.963 9.992 1 12 1h4zm0 2.2c-1.325 0-2.22.616-3.239 2.433l-.533 1.025C10.286 10.373 6.182 18.86 5.23 20.898c-1.168 2.502-1.258 4.548-.285 6.279.972 1.73 2.756 2.623 4.975 2.623 2.115 0 4.195-.916 6.58-2.946.331-.282.812-.282 1.144 0 2.385 2.03 4.465 2.946 6.58 2.946 2.219 0 4.003-.893 4.975-2.623.973-1.731.883-3.777-.285-6.279-.952-2.038-5.056-10.525-7.008-14.24l-.533-1.025C19.22 3.816 18.325 3.2 17 3.2h-1zm0 10.3c2.761 0 5 2.239 5 5 0 2.138-1.353 3.963-3.25 4.664L16 23.4l-.75-.236C13.353 22.463 12 20.638 12 18.5c0-2.761 2.239-5 5-5zm0 2.2c-1.546 0-2.8 1.254-2.8 2.8 0 1.255.828 2.32 1.98 2.674l.82.25.82-.25c1.152-.354 1.98-1.419 1.98-2.674 0-1.546-1.254-2.8-2.8-2.8z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#FF385C] hidden md:inline">
            airbnb
          </span>
        </Link>

        {/* Compact Search Capsule */}
        <div
          onClick={() => setIsSearchExpanded(true)}
          className="flex items-center border border-[#DDDDDD] hover:shadow-md transition-shadow rounded-full py-2 px-4 shadow-sm cursor-pointer divide-x divide-[#DDDDDD] text-sm font-medium"
        >
          <div className="pr-4 pl-1 text-[#222222] truncate max-w-[120px] sm:max-w-[160px]">
            {locationInput || "Anywhere"}
          </div>
          <div className="px-4 text-[#222222] hidden sm:block">
            {checkInInput && checkOutInput ? `${checkInInput} - ${checkOutInput}` : "Any week"}
          </div>
          <div className="pl-4 flex items-center gap-3 text-[#717171]">
            <span className="hidden md:inline">
              {guestsCount > 1 ? `${guestsCount} guests` : "Add guests"}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FF385C] flex items-center justify-center text-white">
              <Search className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Right Nav Options */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/host"
            className="hidden sm:inline-flex px-3.5 py-2.5 rounded-full text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] transition"
          >
            {isHostMode ? "Host Dashboard" : "Airbnb your home"}
          </Link>

          <button
            onClick={toggleHostMode}
            title={isHostMode ? "Switch to Traveling Mode" : "Switch to Hosting Mode"}
            className="hidden lg:flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full border border-[#DDDDDD] hover:bg-[#F7F7F7] transition text-[#222222]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF385C]" />
            {isHostMode ? "Hosting Mode" : "Guest Mode"}
          </button>

          {/* User Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 border border-[#DDDDDD] rounded-full p-1 pl-3.5 hover:shadow-md transition-shadow"
            >
              <Menu className="w-4 h-4 text-[#222222]" />
              <div className="w-8 h-8 rounded-full bg-[#717171] text-white flex items-center justify-center overflow-hidden font-medium text-xs">
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser?.name?.charAt(0) || <UserIcon className="w-4 h-4" />
                )}
              </div>
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#EBEBEB] py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-[#EBEBEB]">
                  <p className="text-xs text-[#717171] uppercase tracking-wider font-semibold">
                    Signed in as
                  </p>
                  <p className="font-semibold text-[#222222] truncate">{currentUser?.name}</p>
                  <p className="text-xs text-[#717171] truncate">{currentUser?.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        isHostMode ? "bg-[#FF385C]" : "bg-emerald-500"
                      }`}
                    />
                    <span className="font-medium text-[#717171]">
                      Mode: <strong className="text-[#222222]">{isHostMode ? "Host" : "Guest"}</strong>
                    </span>
                  </div>
                </div>

                <div className="py-1 border-b border-[#EBEBEB]">
                  <Link
                    href="/trips"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] font-medium text-[#222222]"
                  >
                    <Luggage className="w-4 h-4 text-[#717171]" />
                    My Trips & Reservations
                  </Link>
                  <Link
                    href="/wishlists"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] font-medium text-[#222222]"
                  >
                    <Heart className="w-4 h-4 text-[#FF385C]" />
                    Wishlists / Saved Stays
                  </Link>
                  <Link
                    href="/host"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] font-medium text-[#222222]"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#717171]" />
                    Host Dashboard & Listings
                  </Link>
                </div>

                {/* Switch Users quick selector */}
                <div className="px-4 py-2 border-b border-[#EBEBEB]">
                  <p className="text-xs font-semibold text-[#717171] uppercase tracking-wider mb-2">
                    Switch Test Account
                  </p>
                  <div className="space-y-1">
                    {users.slice(0, 4).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                          currentUser?.id === u.id
                            ? "bg-[#FFF0F2] text-[#FF385C] font-semibold"
                            : "hover:bg-[#F7F7F7] text-[#222222]"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={u.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"}
                            alt={u.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="truncate">
                            {u.name} {u.is_host && "(Host)"}
                          </span>
                        </div>
                        {currentUser?.id === u.id && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleReseed}
                    disabled={isReseeding}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] text-left text-xs font-semibold text-[#717171] hover:text-[#FF385C] transition disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isReseeding ? "animate-spin" : ""}`} />
                    {isReseeding
                      ? "Re-seeding database..."
                      : reseedSuccess
                      ? "Database Seeded!"
                      : "Reset / Re-seed Mock Data"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Interactive Search Overlay Modal */}
      {isSearchExpanded && (
        <div className="fixed inset-0 bg-black/40 z-50 flex flex-col justify-start pt-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            ref={searchBarRef}
            className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-[#DDDDDD] p-4 sm:p-6 relative mt-4 overflow-hidden"
          >
            <button
              onClick={() => setIsSearchExpanded(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#F7F7F7] text-[#717171]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Tabs inside search */}
            <div className="flex items-center justify-center gap-8 mb-6 border-b border-[#EBEBEB] pb-4">
              <button
                onClick={() => setActiveTab("where")}
                className={`text-sm font-semibold pb-1 transition relative ${
                  activeTab === "where"
                    ? "text-[#222222] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#222222]"
                    : "text-[#717171] hover:text-[#222222]"
                }`}
              >
                Where
              </button>
              <button
                onClick={() => setActiveTab("when")}
                className={`text-sm font-semibold pb-1 transition relative ${
                  activeTab === "when"
                    ? "text-[#222222] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#222222]"
                    : "text-[#717171] hover:text-[#222222]"
                }`}
              >
                When
              </button>
              <button
                onClick={() => setActiveTab("who")}
                className={`text-sm font-semibold pb-1 transition relative ${
                  activeTab === "who"
                    ? "text-[#222222] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#222222]"
                    : "text-[#717171] hover:text-[#222222]"
                }`}
              >
                Who
              </button>
            </div>

            {/* Form row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F7F7F7] p-3 rounded-2xl border border-[#DDDDDD]">
              {/* Where input */}
              <div
                onClick={() => setActiveTab("where")}
                className={`p-3 rounded-xl cursor-pointer transition ${
                  activeTab === "where" ? "bg-white shadow-md ring-1 ring-black/5" : "hover:bg-black/5"
                }`}
              >
                <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider">
                  Where
                </label>
                <input
                  type="text"
                  placeholder="Search destinations (e.g. Malibu)"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-[#222222] placeholder-[#717171] focus:outline-none mt-1"
                />
              </div>

              {/* When dates */}
              <div
                onClick={() => setActiveTab("when")}
                className={`p-3 rounded-xl cursor-pointer transition ${
                  activeTab === "when" ? "bg-white shadow-md ring-1 ring-black/5" : "hover:bg-black/5"
                }`}
              >
                <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider">
                  When (Check in & out)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="date"
                    value={checkInInput}
                    onChange={(e) => setCheckInInput(e.target.value)}
                    className="w-1/2 bg-transparent text-xs sm:text-sm font-medium text-[#222222] focus:outline-none"
                  />
                  <span className="text-[#717171]">-</span>
                  <input
                    type="date"
                    value={checkOutInput}
                    onChange={(e) => setCheckOutInput(e.target.value)}
                    className="w-1/2 bg-transparent text-xs sm:text-sm font-medium text-[#222222] focus:outline-none"
                  />
                </div>
              </div>

              {/* Who guests */}
              <div
                onClick={() => setActiveTab("who")}
                className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between ${
                  activeTab === "who" ? "bg-white shadow-md ring-1 ring-black/5" : "hover:bg-black/5"
                }`}
              >
                <div>
                  <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider">
                    Who
                  </label>
                  <div className="text-sm font-medium text-[#222222] mt-1">
                    {guestsCount > 1 ? `${guestsCount} guests` : "1 guest"}
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                    disabled={guestsCount <= 1}
                    className="w-7 h-7 rounded-full border border-[#DDDDDD] flex items-center justify-center text-sm font-bold disabled:opacity-30 hover:border-black"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">{guestsCount}</span>
                  <button
                    onClick={() => setGuestsCount(guestsCount + 1)}
                    className="w-7 h-7 rounded-full border border-[#DDDDDD] flex items-center justify-center text-sm font-bold hover:border-black"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-panels based on active tab */}
            {activeTab === "where" && (
              <div className="mt-6">
                <p className="text-xs font-bold text-[#717171] uppercase tracking-wider mb-3">
                  Search by destination
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {popularDestinations.map((dest) => (
                    <button
                      key={dest.name}
                      onClick={() => setLocationInput(dest.name.split(",")[0])}
                      className="p-3 rounded-xl border border-[#EBEBEB] hover:border-[#222222] text-left transition hover:bg-[#F7F7F7] flex items-start gap-2.5"
                    >
                      <MapPin className="w-4 h-4 text-[#FF385C] mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-[#222222]">{dest.name}</div>
                        <div className="text-xs text-[#717171]">{dest.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-[#EBEBEB] flex items-center justify-between">
              <button
                onClick={clearSearch}
                className="text-sm font-semibold text-[#222222] underline hover:text-[#717171]"
              >
                Clear all
              </button>

              <button
                onClick={handleSearchSubmit}
                className="bg-[#FF385C] hover:bg-[#E00B41] text-white font-semibold py-3 px-8 rounded-full flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Search className="w-4 h-4 stroke-[3]" />
                Search Stays
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export const Navbar: React.FC<NavbarProps> = (props) => {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-50 bg-white border-b border-[#EBEBEB] h-20 flex items-center justify-between px-4 sm:px-8">
          <div className="w-10 h-10 rounded-full bg-[#FF385C]" />
          <div className="h-10 w-64 bg-[#F7F7F7] rounded-full border border-[#DDDDDD]" />
          <div className="w-20 h-10 bg-[#F7F7F7] rounded-full" />
        </header>
      }
    >
      <NavbarContent {...props} />
    </Suspense>
  );
};

