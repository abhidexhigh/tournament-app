// Data loading utilities for reading from JSON files

// Import JSON data directly
import usersData from "../../data/users.json";
import clansData from "../../data/clans.json";

// Load users data from JSON file
export const loadUsers = async () => {
  return usersData;
};

// Load clans data from JSON file
export const loadClans = async () => {
  return clansData;
};

// Get user by ID
export const getUserById = async (userId) => {
  const users = await loadUsers();
  const user = users.find((user) => user.id === userId);
  if (!user) {
    console.warn(`User not found for ID: ${userId}`);
  }
  return user;
};

// Get all clans
export const getAllClans = async () => {
  return await loadClans();
};

// Get clan by ID
export const getClanById = async (clanId) => {
  const clans = await loadClans();
  return clans.find((clan) => clan.id === clanId);
};

// Get user's clans (multiple memberships)
export const getUserClans = async (userId) => {
  console.log("getUserClans called with userId:", userId);

  const user = await getUserById(userId);
  console.log("Found user:", user);

  if (!user || !user.clans || user.clans.length === 0) {
    console.log("No user or no clans found");
    return [];
  }

  const clans = await loadClans();
  console.log("Loaded clans:", clans);

  const result = user.clans
    .map((clanMembership) => {
      const clanData = clans.find((clan) => clan.id === clanMembership.clan_id);
      console.log("Clan membership:", clanMembership, "Clan data:", clanData);
      return {
        ...clanData,
        role: clanMembership.role,
        joined_at: clanMembership.joined_at,
      };
    })
    .filter((clan) => clan.id); // Filter out null clans

  console.log("Final result:", result);
  return result;
};

// Clear caches (useful for development)
export const clearCaches = () => {
  // No caches to clear since we're using direct imports
};
