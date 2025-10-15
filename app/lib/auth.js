// Mock Authentication utilities using localStorage

export const STORAGE_KEYS = {
  USER: "tournament_user",
  USERS_DB: "tournament_users_db",
  TOURNAMENTS: "tournament_tournaments_db",
  TRANSACTIONS: "tournament_transactions_db",
};

// Initialize mock database with sample data
export const initializeMockData = () => {
  if (typeof window === "undefined") return;

  // Check if data already exists
  if (localStorage.getItem(STORAGE_KEYS.USERS_DB)) return;

  // Mock users
  const mockUsers = [
    {
      id: "host1",
      username: "ProGamerYT",
      email: "progamer@youtube.com",
      type: "host",
      diamonds: 5000,
      avatar: "👑",
    },
    {
      id: "host2",
      username: "GamingKing",
      email: "gamingking@youtube.com",
      type: "host",
      diamonds: 3500,
      avatar: "🎮",
    },
    {
      id: "player1",
      username: "ShadowNinja",
      email: "shadow@player.com",
      type: "player",
      diamonds: 2500,
      avatar: "🥷",
    },
    {
      id: "player2",
      username: "ThunderStrike",
      email: "thunder@player.com",
      type: "player",
      diamonds: 1800,
      avatar: "⚡",
    },
    {
      id: "player3",
      username: "PhoenixRider",
      email: "phoenix@player.com",
      type: "player",
      diamonds: 3200,
      avatar: "🔥",
    },
    {
      id: "player4",
      username: "IceQueen",
      email: "ice@player.com",
      type: "player",
      diamonds: 1500,
      avatar: "❄️",
    },
  ];

  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(mockUsers));
  localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
};

// Login function
export const login = (email, password, userType) => {
  if (typeof window === "undefined") return null;

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || "[]");
  const user = users.find((u) => u.email === email && u.type === userType);

  if (user) {
    // In a real app, we'd verify password here
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  }

  return null;
};

// Register function
export const register = (username, email, userType) => {
  if (typeof window === "undefined") return null;

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || "[]");

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    return null;
  }

  const newUser = {
    id: `${userType}${Date.now()}`,
    username,
    email,
    type: userType,
    diamonds: userType === "host" ? 5000 : 1000, // Hosts get more starting diamonds
    avatar: userType === "host" ? "👑" : "🎮",
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));

  return newUser;
};

// Logout function
export const logout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Get current user
export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

// Update user diamonds
export const updateUserDiamonds = (userId, amount, operation = "add") => {
  if (typeof window === "undefined") return false;

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || "[]");
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) return false;

  if (operation === "add") {
    users[userIndex].diamonds += amount;
  } else if (operation === "subtract") {
    if (users[userIndex].diamonds < amount) return false; // Insufficient funds
    users[userIndex].diamonds -= amount;
  }

  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));

  // Update current user if it's the same user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(users[userIndex]));
  }

  return true;
};

// Get user by ID
export const getUserById = (userId) => {
  if (typeof window === "undefined") return null;
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || "[]");
  return users.find((u) => u.id === userId);
};
