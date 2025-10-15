"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usersApi } from "../lib/api";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    const loadUser = async () => {
      if (status === "authenticated" && session?.user) {
        try {
          // Find user by email in the API
          const users = await usersApi.getAll();
          const foundUser = users.find((u) => u.email === session.user.email);

          if (foundUser) {
            setUser(foundUser);
          } else {
            // User not found in API, might be a new OAuth user
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to load user:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();
  }, [session, status]);

  const refreshUser = async () => {
    if (user?.id) {
      try {
        const updatedUser = await usersApi.getById(user.id);
        setUser(updatedUser);
        return updatedUser;
      } catch (error) {
        console.error("Failed to refresh user:", error);
      }
    }
    return null;
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
