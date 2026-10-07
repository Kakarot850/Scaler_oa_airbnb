"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { api } from "@/services/api";

interface WishlistContextType {
  wishlistIds: Set<number>;
  toggleWishlist: (listingId: number) => Promise<void>;
  isSaved: (listingId: number) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: new Set(),
  toggleWishlist: async () => {},
  isSaved: () => false,
  refreshWishlist: async () => {},
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useUser();
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());

  const fetchWishlists = async () => {
    if (!currentUser) return;
    try {
      const items = await api.getWishlists(currentUser.id);
      setWishlistIds(new Set(items.map((i) => i.id)));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchWishlists();
  }, [currentUser?.id]);

  const toggleWishlist = async (listingId: number) => {
    if (!currentUser) return;

    // Optimistic toggle
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(listingId)) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });

    try {
      const res = await api.toggleWishlist(currentUser.id, listingId);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (res.is_saved) {
          next.add(listingId);
        } else {
          next.delete(listingId);
        }
        return next;
      });
    } catch (err) {
      // Revert optimistic update
      console.error("Failed to toggle wishlist", err);
      fetchWishlists();
    }
  };

  const isSaved = (listingId: number) => wishlistIds.has(listingId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        isSaved,
        refreshWishlist: fetchWishlists,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
