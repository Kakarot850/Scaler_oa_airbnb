"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { api } from "@/services/api";

interface UserContextType {
  currentUser: User | null;
  users: User[];
  isHostMode: boolean;
  toggleHostMode: () => void;
  switchUser: (userId: number) => void;
  refreshUsers: () => Promise<void>;
}

// Fallback guest & host in case server is just booting
const defaultGuest: User = {
  id: 5,
  name: "Chloe Bennett",
  email: "chloe.guest@airbnb-clone.com",
  avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
  is_host: false,
  created_at: new Date().toISOString(),
};

const defaultHost: User = {
  id: 1,
  name: "Sarah Jenkins",
  email: "sarah.jenkins@airbnb-clone.com",
  avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
  is_host: true,
  created_at: new Date().toISOString(),
};

const UserContext = createContext<UserContextType>({
  currentUser: defaultGuest,
  users: [defaultGuest, defaultHost],
  isHostMode: false,
  toggleHostMode: () => {},
  switchUser: () => {},
  refreshUsers: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([defaultGuest, defaultHost]);
  const [currentUser, setCurrentUser] = useState<User | null>(defaultGuest);
  const [isHostMode, setIsHostMode] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      const fetched = await api.getUsers();
      if (fetched && fetched.length > 0) {
        setUsers(fetched);
        // keep current user or set to first guest
        if (!currentUser) {
          const guest = fetched.find((u) => !u.is_host) || fetched[0];
          setCurrentUser(guest);
        } else {
          const matching = fetched.find((u) => u.id === currentUser.id);
          if (matching) setCurrentUser(matching);
        }
      }
    } catch {
      // server may still be initializing
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleHostMode = () => {
    setIsHostMode((prev) => {
      const nextMode = !prev;
      if (nextMode) {
        // switch to default host if current user is not a host
        const hostUser = users.find((u) => u.is_host) || defaultHost;
        setCurrentUser(hostUser);
      } else {
        // switch to default guest
        const guestUser = users.find((u) => !u.is_host) || defaultGuest;
        setCurrentUser(guestUser);
      }
      return nextMode;
    });
  };

  const switchUser = (userId: number) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setIsHostMode(target.is_host);
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        isHostMode,
        toggleHostMode,
        switchUser,
        refreshUsers: fetchUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
