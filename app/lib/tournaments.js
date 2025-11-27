// Tournament management utilities

import { STORAGE_KEYS, updateUserDiamonds, getUserById } from "./auth";

// Get all tournaments
export const getAllTournaments = () => {
  if (typeof window === "undefined") return [];
  const tournaments = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
  return tournaments ? JSON.parse(tournaments) : [];
};

// Get tournament by ID
export const getTournamentById = (id) => {
  const tournaments = getAllTournaments();
  return tournaments.find((t) => t.id === id);
};

// Get tournaments by host ID
export const getTournamentsByHostId = (hostId) => {
  const tournaments = getAllTournaments();
  return tournaments.filter((t) => t.hostId === hostId);
};

// Create tournament
export const createTournament = (tournamentData, hostId) => {
  if (typeof window === "undefined") return null;

  // Check if host has enough diamonds
  const success = updateUserDiamonds(hostId, 500, "subtract");
  if (!success) return null;

  const newTournament = {
    id: `tournament_${Date.now()}`,
    ...tournamentData,
    hostId,
    participants: [],
    winners: null,
    status: "upcoming", // upcoming, ongoing, completed
    createdAt: new Date().toISOString(),
  };

  const tournaments = getAllTournaments();
  tournaments.push(newTournament);
  localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));

  // Add transaction
  addTransaction({
    userId: hostId,
    type: "tournament_creation",
    amount: -500,
    description: `Created tournament: ${tournamentData.title}`,
    tournamentId: newTournament.id,
  });

  return newTournament;
};

// Join tournament
export const joinTournament = (tournamentId, userId) => {
  if (typeof window === "undefined") return false;

  const tournaments = getAllTournaments();
  const tournamentIndex = tournaments.findIndex((t) => t.id === tournamentId);

  if (tournamentIndex === -1) return false;

  const tournament = tournaments[tournamentIndex];

  // Check if tournament is full
  if (tournament.participants.length >= tournament.maxPlayers) return false;

  // Check if user already joined
  if (tournament.participants.includes(userId)) return false;

  // Add user to participants
  tournament.participants.push(userId);
  tournaments[tournamentIndex] = tournament;
  localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));

  return true;
};

// Update tournament status
export const updateTournamentStatus = (tournamentId, status) => {
  if (typeof window === "undefined") return false;

  const tournaments = getAllTournaments();
  const tournamentIndex = tournaments.findIndex((t) => t.id === tournamentId);

  if (tournamentIndex === -1) return false;

  tournaments[tournamentIndex].status = status;
  localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));

  return true;
};

// Declare winners and distribute prizes
export const declareWinners = (tournamentId, winners) => {
  if (typeof window === "undefined") return false;

  const tournaments = getAllTournaments();
  const tournamentIndex = tournaments.findIndex((t) => t.id === tournamentId);

  if (tournamentIndex === -1) return false;

  const tournament = tournaments[tournamentIndex];

  // Calculate prize distribution
  const prizePool = tournament.prizePool;
  const split = tournament.prizeSplit;

  const prizes = {
    first: Math.floor((prizePool * split.first) / 100),
    second: Math.floor((prizePool * split.second) / 100),
    third: Math.floor((prizePool * split.third) / 100),
  };

  // Update winners and status
  tournaments[tournamentIndex].winners = winners;
  tournaments[tournamentIndex].status = "completed";
  localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));

  // Distribute prizes
  if (winners.first) {
    updateUserDiamonds(winners.first, prizes.first, "add");
    addTransaction({
      userId: winners.first,
      type: "prize_won",
      amount: prizes.first,
      description: `🥇 1st Place in ${tournament.title}`,
      tournamentId,
    });
  }

  if (winners.second) {
    updateUserDiamonds(winners.second, prizes.second, "add");
    addTransaction({
      userId: winners.second,
      type: "prize_won",
      amount: prizes.second,
      description: `🥈 2nd Place in ${tournament.title}`,
      tournamentId,
    });
  }

  if (winners.third) {
    updateUserDiamonds(winners.third, prizes.third, "add");
    addTransaction({
      userId: winners.third,
      type: "prize_won",
      amount: prizes.third,
      description: `🥉 3rd Place in ${tournament.title}`,
      tournamentId,
    });
  }

  return true;
};

// Add transaction
export const addTransaction = (transaction) => {
  if (typeof window === "undefined") return;

  const transactions = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]",
  );
  transactions.push({
    id: `tx_${Date.now()}`,
    ...transaction,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

// Get transactions by user ID
export const getTransactionsByUserId = (userId) => {
  if (typeof window === "undefined") return [];
  const transactions = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]",
  );
  return transactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Get tournaments by status
export const getTournamentsByStatus = (status) => {
  const tournaments = getAllTournaments();
  return tournaments.filter((t) => t.status === status);
};

// Filter tournaments the user has joined
export const getUserTournaments = (userId) => {
  const tournaments = getAllTournaments();
  return tournaments.filter((t) => t.participants.includes(userId));
};
