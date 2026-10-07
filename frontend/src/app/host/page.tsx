"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Home,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CreateListingModal } from "@/components/CreateListingModal";
import { EditListingModal } from "@/components/EditListingModal";
import { HostDashboardData, ListingDetail, Category, Amenity } from "@/types";
import { api } from "@/services/api";
import { useUser } from "@/context/UserContext";

export default function HostDashboardPage() {
  const { currentUser, isHostMode, toggleHostMode, switchUser, users } = useUser();

  const [dashboardData, setDashboardData] = useState<HostDashboardData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"listings" | "reservations">("listings");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<ListingDetail | null>(null);

  // If currentUser is not a host, prompt switching or switch to Sarah Jenkins (default host)
  const hostUser = currentUser?.is_host
    ? currentUser
    : users.find((u) => u.is_host) || currentUser;

  const fetchHostData = async () => {
    if (!hostUser) return;
    setIsLoading(true);
    try {
      const data = await api.getHostDashboard(hostUser.id);
      setDashboardData(data);

      const [cats, amens] = await Promise.all([api.getCategories(), api.getAmenities()]);
      setCategories(cats);
      setAmenities(amens);
    } catch (err) {
      console.error("Failed to load host dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHostData();
  }, [hostUser?.id]);

  const handleDeleteListing = async (listingId: number) => {
    if (!hostUser) return;
    const confirm = window.confirm("Are you sure you want to permanently delete this listing?");
    if (!confirm) return;

    try {
      await api.deleteListing(listingId, hostUser.id);
      await fetchHostData();
    } catch (err: any) {
      alert("Failed to delete listing: " + err.message);
    }
  };

  return (
    <>
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 flex-1 w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF0F2] text-[#FF385C]">
                Host Mode
              </span>
              <span className="text-xs text-[#717171]">
                Hosting as <strong>{hostUser?.name}</strong>
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#222222] tracking-tight mt-1">
              Host Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!currentUser?.is_host && (
              <button
                onClick={() => {
                  const defaultH = users.find((u) => u.is_host);
                  if (defaultH) switchUser(defaultH.id);
                }}
                className="px-4 py-2.5 rounded-full border border-[#DDDDDD] text-xs font-semibold text-[#222222] hover:bg-[#F7F7F7] transition"
              >
                Switch to Sarah Jenkins (Superhost Account)
              </button>
            )}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#FF385C] hover:bg-[#E00B41] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md transition active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create a Listing</span>
            </button>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-3xl bg-[#F7F7F7] border border-[#EBEBEB]">
            <div className="flex items-center justify-between text-[#717171] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Listings</span>
              <Home className="w-5 h-5 text-[#222222]" />
            </div>
            <p className="text-3xl font-bold text-[#222222]">
              {dashboardData?.total_listings ?? 0}
            </p>
            <p className="text-xs text-[#717171] mt-1">Published homes and chalets</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#F7F7F7] border border-[#EBEBEB]">
            <div className="flex items-center justify-between text-[#717171] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Reservations Booked</span>
              <Calendar className="w-5 h-5 text-[#222222]" />
            </div>
            <p className="text-3xl font-bold text-[#222222]">
              {dashboardData?.total_bookings ?? 0}
            </p>
            <p className="text-xs text-[#717171] mt-1">Confirmed guest bookings</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#F7F7F7] border border-[#EBEBEB]">
            <div className="flex items-center justify-between text-[#717171] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Payouts</span>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              ${dashboardData?.total_revenue ? dashboardData.total_revenue.toLocaleString() : "0"}
            </p>
            <p className="text-xs text-[#717171] mt-1">Gross earnings from reservations</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-[#EBEBEB] mb-8">
          <button
            onClick={() => setActiveTab("listings")}
            className={`pb-3 text-sm font-semibold transition relative ${
              activeTab === "listings"
                ? "text-[#222222] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#222222]"
                : "text-[#717171] hover:text-[#222222]"
            }`}
          >
            Your Listings ({dashboardData?.listings?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("reservations")}
            className={`pb-3 text-sm font-semibold transition relative ${
              activeTab === "reservations"
                ? "text-[#222222] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#222222]"
                : "text-[#717171] hover:text-[#222222]"
            }`}
          >
            Reservations ({dashboardData?.recent_bookings?.length || 0})
          </button>
        </div>

        {/* Content by Tab */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : activeTab === "listings" ? (
          dashboardData?.listings && dashboardData.listings.length > 0 ? (
            <div className="border border-[#EBEBEB] rounded-3xl overflow-hidden bg-white shadow-sm divide-y divide-[#EBEBEB]">
              {dashboardData.listings.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F7F7F7]/60 transition"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        item.images?.[0]?.image_url ||
                        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200"
                      }
                      alt={item.title}
                      className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div>
                      <span className="text-xs font-semibold text-[#717171] uppercase">
                        {item.property_type} · {item.city}, {item.state}
                      </span>
                      <h3 className="font-bold text-base text-[#222222] mt-0.5">{item.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-[#717171] mt-1">
                        <span>
                          <strong className="text-[#222222] font-semibold">${item.price_per_night}</strong> / night
                        </span>
                        <span>·</span>
                        <span>{item.max_guests} guests</span>
                        <span>·</span>
                        <span>★ {item.rating.toFixed(2)} ({item.reviews_count} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Link
                      href={`/rooms/${item.id}`}
                      className="p-2.5 rounded-xl border border-[#DDDDDD] hover:border-black text-[#222222] transition text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" /> View
                    </Link>
                    <button
                      onClick={() => setEditingListing(item)}
                      className="p-2.5 rounded-xl border border-[#DDDDDD] hover:border-black text-[#222222] transition text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteListing(item.id)}
                      className="p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed border-[#DDDDDD] rounded-3xl p-8">
              <Home className="w-12 h-12 text-[#717171] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#222222]">You haven't listed any properties yet</h3>
              <p className="text-xs text-[#717171] mt-1">Start hosting and earning today.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-6 py-2.5 bg-[#FF385C] text-white text-xs font-semibold rounded-full"
              >
                Create your first listing
              </button>
            </div>
          )
        ) : dashboardData?.recent_bookings && dashboardData.recent_bookings.length > 0 ? (
          <div className="border border-[#EBEBEB] rounded-3xl overflow-hidden bg-white shadow-sm divide-y divide-[#EBEBEB]">
            {dashboardData.recent_bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#717171] text-white flex items-center justify-center font-bold text-sm">
                    {booking.user?.avatar_url ? (
                      <img
                        src={booking.user.avatar_url}
                        alt={booking.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      booking.user?.name?.charAt(0) || "G"
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#222222]">
                      {booking.user?.name || "Guest"}
                    </h4>
                    <p className="text-xs text-[#717171]">
                      Booked: <strong>{booking.listing?.title}</strong>
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[#717171] mt-1">
                      <span>{booking.check_in} → {booking.check_out}</span>
                      <span>·</span>
                      <span>{booking.guests_count} guest{booking.guests_count > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Payout: ${booking.total_price.toFixed(2)}
                  </span>
                  <p className="text-[11px] text-[#717171] mt-1.5">Status: {booking.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border border-dashed border-[#DDDDDD] rounded-3xl p-8">
            <Calendar className="w-12 h-12 text-[#717171] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#222222]">No reservations yet</h3>
            <p className="text-xs text-[#717171] mt-1">
              When guests book your homes, reservations will appear here.
            </p>
          </div>
        )}
      </main>

      {/* Create Listing Modal */}
      {hostUser && (
        <CreateListingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          categories={categories}
          amenities={amenities}
          hostId={hostUser.id}
          onListingCreated={fetchHostData}
        />
      )}

      {/* Edit Listing Modal */}
      {editingListing && hostUser && (
        <EditListingModal
          isOpen={Boolean(editingListing)}
          onClose={() => setEditingListing(null)}
          listing={editingListing}
          categories={categories}
          hostId={hostUser.id}
          onListingUpdated={() => {
            setEditingListing(null);
            fetchHostData();
          }}
        />
      )}
    </>
  );
}
