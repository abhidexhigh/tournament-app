// Enhanced authentication helpers that work with NextAuth and localStorage

import { STORAGE_KEYS } from "./auth";
import { usersApi } from "./api";

// Sync NextAuth user with localStorage
export const syncUserWithStorage = (sessionUser) => {
  if (typeof window === "undefined") return null;

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || "[]");
  let user = users.find((u) => u.email === sessionUser.email);

  if (!user) {
    // New user from OAuth - create user without role
    user = {
      id: sessionUser.id || `user_${Date.now()}`,
      username: sessionUser.name || sessionUser.email.split("@")[0],
      email: sessionUser.email,
      type: null, // Role to be set later
      diamonds: 1000,
      avatar: "🎮",
      provider: sessionUser.provider || "google",
    };
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  }

  // Update current user in storage
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
};

// Update user role
export const updateUserRole = async (userId, role) => {
  if (typeof window === "undefined") return false;

  try {
    const updateData = {
      type: role,
    };

    // Update diamonds based on role if they have default amount
    if (role === "host") {
      const currentUser = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USER) || "{}",
      );
      if (!currentUser.diamonds || currentUser.diamonds < 5000) {
        updateData.diamonds = 5000;
      }
      updateData.avatar = "👑";
    } else {
      updateData.avatar = "🎮";
    }

    const updatedUser = await usersApi.update(userId, updateData);

    // Update localStorage
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || "[]");
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    }

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    return true;
  } catch (error) {
    console.error("Failed to update user role:", error);
    return false;
  }
};

// Check if user has selected a role
export const hasUserRole = (user) => {
  // A user has a role if type is set and is NOT 'player' (default for new users)
  // OR if they explicitly chose 'player' in the select-role page.
  // For now, let's stick to checking if it's not null/undefined.
  return user && user.type !== null && user.type !== undefined;
};

// Unified login for email/password
export const loginWithCredentials = async (email, password) => {
  if (typeof window === "undefined") return null;

  try {
    // Check DB first
    const user = await usersApi.getByEmail(email);

    if (user) {
      // In a real app, verify password hash here
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      // Update users database in localStorage for compatibility
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS_DB) || "[]",
      );
      const userIndex = users.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));

      return user;
    }
  } catch (error) {
    console.error("Login error in authHelpers:", error);
  }

  return null;
};

// Refresh user data from API and update localStorage
export const refreshUserFromAPI = async (userId) => {
  if (typeof window === "undefined") return null;

  try {
    const updatedUser = await usersApi.getById(userId);
    if (updatedUser) {
      // Update localStorage with fresh data
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      // Also update the users database in localStorage
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS_DB) || "[]",
      );
      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
      }

      return updatedUser;
    }
  } catch (error) {
    console.error("Failed to refresh user from API:", error);
  }

  return null;
};

// Unified registration
export const registerUser = async (username, email, password) => {
  if (typeof window === "undefined") return null;

  try {
    // Check if user already exists
    const existingUser = await usersApi.getByEmail(email);
    if (existingUser) {
      console.log("User already exists:", email);
      return null;
    }

    const newUser = {
      username,
      email,
      type: "player", // Default role to satisfy DB constraint
      diamonds: 1000,
      avatar: "🎮",
      provider: "credentials",
    };

    const savedUser = await usersApi.create(newUser);

    if (savedUser) {
      // Update localStorage for compatibility
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS_DB) || "[]",
      );
      users.push(savedUser);
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(savedUser));
      return savedUser;
    }
  } catch (error) {
    console.error("Registration error in authHelpers:", error);
  }

  return null;
};
