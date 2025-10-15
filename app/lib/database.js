// Database utilities for JSON file operations
// This structure is designed to be easily migrated to PostgreSQL

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generic function to read JSON data
export const readJsonData = (filename) => {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}.json:`, error);
    return [];
  }
};

// Generic function to write JSON data
export const writeJsonData = (filename, data) => {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}.json:`, error);
    return false;
  }
};

// Generate unique ID
export const generateId = (prefix = "") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get current timestamp
export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

// Users operations
export const usersDb = {
  getAll: () => readJsonData("users"),
  getById: (id) => {
    const users = readJsonData("users");
    return users.find((user) => user.id === id);
  },
  getByEmail: (email) => {
    const users = readJsonData("users");
    return users.find((user) => user.email === email);
  },
  create: (userData) => {
    const users = readJsonData("users");
    const newUser = {
      id: generateId("user"),
      ...userData,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    };
    users.push(newUser);
    writeJsonData("users", users);
    return newUser;
  },
  update: (id, updateData) => {
    const users = readJsonData("users");
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updated_at: getCurrentTimestamp(),
    };
    writeJsonData("users", users);
    return users[userIndex];
  },
  updateDiamonds: (id, amount) => {
    const user = usersDb.getById(id);
    if (!user) return null;

    const newBalance = user.diamonds + amount;
    return usersDb.update(id, { diamonds: newBalance });
  },
};

// Tournaments operations
export const tournamentsDb = {
  getAll: () => readJsonData("tournaments"),
  getById: (id) => {
    const tournaments = readJsonData("tournaments");
    return tournaments.find((tournament) => tournament.id === id);
  },
  getByHostId: (hostId) => {
    const tournaments = readJsonData("tournaments");
    return tournaments.filter((tournament) => tournament.host_id === hostId);
  },
  create: (tournamentData) => {
    const tournaments = readJsonData("tournaments");
    const newTournament = {
      id: generateId("tournament"),
      ...tournamentData,
      participants: [],
      winner_first: null,
      winner_second: null,
      winner_third: null,
      status: "upcoming",
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    };
    tournaments.push(newTournament);
    writeJsonData("tournaments", tournaments);
    return newTournament;
  },
  update: (id, updateData) => {
    const tournaments = readJsonData("tournaments");
    const tournamentIndex = tournaments.findIndex(
      (tournament) => tournament.id === id
    );
    if (tournamentIndex === -1) return null;

    tournaments[tournamentIndex] = {
      ...tournaments[tournamentIndex],
      ...updateData,
      updated_at: getCurrentTimestamp(),
    };
    writeJsonData("tournaments", tournaments);
    return tournaments[tournamentIndex];
  },
  addParticipant: (id, userId) => {
    const tournament = tournamentsDb.getById(id);
    if (!tournament) return null;

    if (tournament.participants.includes(userId)) {
      throw new Error("You are already registered for this tournament");
    }

    if (tournament.participants.length >= tournament.max_players) {
      throw new Error("Tournament is full");
    }

    return tournamentsDb.update(id, {
      participants: [...tournament.participants, userId],
    });
  },
  declareWinners: (id, winners) => {
    return tournamentsDb.update(id, {
      winner_first: winners.first,
      winner_second: winners.second,
      winner_third: winners.third,
      status: "completed",
    });
  },
  updateStatus: (id, status) => {
    return tournamentsDb.update(id, { status });
  },
};

// Transactions operations
export const transactionsDb = {
  getAll: () => readJsonData("transactions"),
  getByUserId: (userId) => {
    const transactions = readJsonData("transactions");
    return transactions.filter((transaction) => transaction.user_id === userId);
  },
  create: (transactionData) => {
    const transactions = readJsonData("transactions");
    const newTransaction = {
      id: generateId("transaction"),
      ...transactionData,
      created_at: getCurrentTimestamp(),
    };
    transactions.push(newTransaction);
    writeJsonData("transactions", transactions);
    return newTransaction;
  },
};
