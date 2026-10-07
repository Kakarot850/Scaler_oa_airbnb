"use client";

import React from "react";
import { UserProvider } from "@/context/UserContext";
import { WishlistProvider } from "@/context/WishlistContext";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UserProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </UserProvider>
  );
};
