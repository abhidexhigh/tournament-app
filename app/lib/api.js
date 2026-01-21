// API service functions to replace localStorage operations
// These functions make HTTP requests to our API endpoints

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL || "/api"
    : "/api";

// Get CSRF token from storage or fetch new one
const getCSRFToken = async () => {
  try {
    // Try to get from sessionStorage first
    const stored = sessionStorage.getItem("csrf_token");
    if (stored) {
      return stored;
    }

    // Fetch new token
    const response = await fetch(`${API_BASE_URL}/csrf-token`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.token) {
        // Store in sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.setItem("csrf_token", data.token);
        }
        return data.token;
      }
    }
  } catch (error) {
    console.error("Failed to get CSRF token:", error);
  }
  return null;
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    // Get CSRF token for non-GET requests
    let csrfToken = null;
    if (
      options.method &&
      options.method !== "GET" &&
      options.method !== "HEAD" &&
      options.method !== "OPTIONS"
    ) {
      csrfToken = await getCSRFToken();
    }

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add CSRF token to headers
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    // Add CSRF token to body if it's a JSON request
    let body = options.body;
    if (csrfToken && body && typeof body === "string") {
      try {
        const bodyObj = JSON.parse(body);
        bodyObj.csrfToken = csrfToken;
        body = JSON.stringify(bodyObj);
      } catch (e) {
        // Body is not JSON, add to headers only
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      // If CSRF token error, clear stored token and retry once
      if (
        response.status === 403 &&
        (data.error?.includes("CSRF") || data.error?.includes("csrf"))
      ) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("csrf_token");
        }
        // Retry with new token (only once)
        const newToken = await getCSRFToken();
        if (newToken) {
          const retryHeaders = {
            ...headers,
            "X-CSRF-Token": newToken,
          };
          let retryBody = body;
          if (retryBody && typeof retryBody === "string") {
            try {
              const bodyObj = JSON.parse(retryBody);
              bodyObj.csrfToken = newToken;
              retryBody = JSON.stringify(bodyObj);
            } catch (e) {
              // Body is not JSON, keep original
            }
          }
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: retryHeaders,
            body: retryBody,
          });
          const retryData = await retryResponse.json();
          if (!retryResponse.ok) {
            throw new Error(retryData.error || "API request failed");
          }
          return retryData;
        }
      }
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
      const response = await apiRequest(
        `/users?email=${encodeURIComponent(email)}`,
      );
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

  // Cancel tournament and refund participants
  cancelTournament: async (id, hostId) => {
    const response = await apiRequest(`/tournaments/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ host_id: hostId }),
    });
    // Format the tournament dates in the response
    if (response.data) {
      response.data = formatTournamentDates(response.data);
    }
    return response;
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
