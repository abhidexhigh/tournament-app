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
      if (status === "authenticated" && session?.user?.email) {
        try {
          // Try to get user by email directly
          const response = await fetch(`/api/users?email=${session.user.email}`);
          const data = await response.json();

          if (data.success && data.data) {
            // The API might return an array or a single user depending on implementation
            const foundUser = Array.isArray(data.data) 
              ? data.data.find(u => u.email === session.user.email)
              : data.data;
            
            if (foundUser) {
              setUser(foundUser);
            } else {
              setUser(null);
            }
          } else {
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
