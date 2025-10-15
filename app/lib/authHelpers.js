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
export const updateUserRole = (userId, role) => {
  if (typeof window === "undefined") return false;

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || "[]");
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) return false;

  users[userIndex].type = role;

  // Update diamonds based on role
  if (role === "host" && users[userIndex].diamonds < 5000) {
    users[userIndex].diamonds = 5000;
  }

  // Update avatar
  users[userIndex].avatar = role === "host" ? "👑" : "🎮";

  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));

  // Update current user
  const currentUser = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.USER) || "{}"
  );
  if (currentUser.id === userId) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(users[userIndex]));
  }

  return true;
};

// Check if user has selected a role
export const hasUserRole = (user) => {
  return user && user.type !== null && user.type !== undefined;
};

// Unified login for email/password
export const loginWithCredentials = (email, password) => {
  if (typeof window === "undefined") return null;

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || "[]");
  const user = users.find((u) => u.email === email);

  if (user) {
    // In a real app, verify password hash here
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
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
        localStorage.getItem(STORAGE_KEYS.USERS_DB) || "[]"
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
export const registerUser = (username, email, password) => {
  if (typeof window === "undefined") return null;

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || "[]");

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    return null;
  }

  const newUser = {
    id: `user_${Date.now()}`,
    username,
    email,
    type: null, // Role to be set later
    diamonds: 1000,
    avatar: "🎮",
    provider: "credentials",
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));

  return newUser;
};
