// API service functions to replace localStorage operations
// These functions make HTTP requests to our API endpoints

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL || "/api"
    : "/api";

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Users API functions
export const usersApi = {
  // Get all users
  getAll: async () => {
    const response = await apiRequest("/users");
    return response.data;
  },

  // Get user by ID
  getById: async (id) => {
    const response = await apiRequest(`/users/${id}`);
    return response.data;
  },

  // Get user by email
  getByEmail: async (email) => {
    try {
      const response = await apiRequest(`/users?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  },

  // Create new user
  create: async (userData) => {
    const response = await apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return response.data;
  },

  // Update user
  update: async (id, updateData) => {
    const response = await apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
    return response.data;
  },

  // Update user diamonds
  updateDiamonds: async (id, amount) => {
    const response = await apiRequest(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ amount }),
    });
    return response.data;
  },
};

// Helper function to format tournament dates
const formatTournamentDates = (tournament) => {
  if (!tournament) return tournament;

  // Ensure date is in YYYY-MM-DD format
  // PostgreSQL returns DATE columns as JavaScript Date objects at UTC midnight
  // We use getUTC* methods to extract the correct date without timezone shifts
  if (tournament.date) {
    if (tournament.date instanceof Date) {
      const year = tournament.date.getUTCFullYear();
      const month = String(tournament.date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(tournament.date.getUTCDate()).padStart(2, "0");
      tournament.date = `${year}-${month}-${day}`;
    } else if (
      typeof tournament.date === "string" &&
      tournament.date.includes("T")
    ) {
      tournament.date = tournament.date.split("T")[0];
    }
  }

  return tournament;
};

// Tournaments API functions
export const tournamentsApi = {
  // Get all tournaments
  getAll: async () => {
    const response = await apiRequest("/tournaments");
    return response.data.map(formatTournamentDates);
  },

  // Get tournament by ID
  getById: async (id) => {
    const response = await apiRequest(`/tournaments/${id}`);
    return formatTournamentDates(response.data);
  },

  // Get tournaments by host ID
  getByHostId: async (hostId) => {
    const tournaments = await tournamentsApi.getAll();
    return tournaments.filter((tournament) => tournament.host_id === hostId);
  },

  // Create new tournament
  create: async (tournamentData) => {
    const response = await apiRequest("/tournaments", {
      method: "POST",
      body: JSON.stringify(tournamentData),
    });
    return response.data;
  },

  // Update tournament
  update: async (id, updateData) => {
    const response = await apiRequest(`/tournaments/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
    return response.data;
  },

  // Join tournament
  join: async (id, userId, paymentData = {}) => {
    const response = await apiRequest(`/tournaments/${id}/join`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        ...paymentData,
      }),
    });
    return response.data;
  },

  // Declare winners
  declareWinners: async (id, winners, hostId) => {
    const response = await apiRequest(`/tournaments/${id}/winners`, {
      method: "POST",
      body: JSON.stringify({ winners, host_id: hostId }),
    });
    return response.data;
  },

  // Update tournament status
  updateStatus: async (id, status) => {
    return tournamentsApi.update(id, { status });
  },
};

// Transactions API functions
export const transactionsApi = {
  // Get all transactions
  getAll: async () => {
    const response = await apiRequest("/transactions");
    return response.data;
  },

  // Get transactions by user ID
  getByUserId: async (userId) => {
    const response = await apiRequest(`/transactions?user_id=${userId}`);
    return response.data;
  },

  // Create new transaction
  create: async (transactionData) => {
    const response = await apiRequest("/transactions", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
    return response.data;
  },
};

// Legacy compatibility functions (to replace localStorage functions)
export const authApi = {
  // Get current user (from session)
  getCurrentUser: async () => {
    // This will be handled by NextAuth session
    // For now, we'll return null and let the frontend handle it
    return null;
  },

  // Login user (handled by NextAuth)
  login: async (email, password) => {
    // This is handled by NextAuth
    throw new Error("Use NextAuth signIn instead");
  },

  // Register user
  register: async (userData) => {
    return usersApi.create(userData);
  },

  // Logout (handled by NextAuth)
  logout: async () => {
    // This is handled by NextAuth
    throw new Error("Use NextAuth signOut instead");
  },

  // Update user diamonds
  updateUserDiamonds: async (userId, amount) => {
    return usersApi.updateDiamonds(userId, amount);
  },

  // Get user by ID
  getUserById: async (id) => {
    return usersApi.getById(id);
  },
};

// Matches API functions
export const matchesApi = {
  // Get all matches
  getAll: async () => {
    const response = await apiRequest("/matches");
    return response.data;
  },

  // Get match by ID
  getById: async (id) => {
    const response = await apiRequest(`/matches/${id}`);
    return response.data;
  },

  // Get matches by player ID
  getByPlayerId: async (playerId) => {
    const response = await apiRequest(`/matches?player_id=${playerId}`);
    return response.data;
  },

  // Get matches by tournament ID
  getByTournamentId: async (tournamentId) => {
    const response = await apiRequest(`/matches?tournament_id=${tournamentId}`);
    return response.data;
  },

  // Get matches by status
  getByStatus: async (status) => {
    const response = await apiRequest(`/matches?status=${status}`);
    return response.data;
  },

  // Create new match
  create: async (matchData) => {
    const response = await apiRequest("/matches", {
      method: "POST",
      body: JSON.stringify(matchData),
    });
    return response.data;
  },

  // Update match
  update: async (id, updateData) => {
    const response = await apiRequest(`/matches/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
    return response.data;
  },

  // Delete match
  delete: async (id) => {
    const response = await apiRequest(`/matches/${id}`, {
      method: "DELETE",
    });
    return response.data;
  },
};

// Export all API functions
const api = {
  users: usersApi,
  tournaments: tournamentsApi,
  transactions: transactionsApi,
  matches: matchesApi,
  auth: authApi,
};

export default api;
