// Initialize mock data for the tournament app

import { STORAGE_KEYS } from "./auth";

export const initializeMockTournaments = () => {
  if (typeof window === "undefined") return;

  // Check if tournaments already exist
  const existingTournaments = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
  if (existingTournaments && JSON.parse(existingTournaments).length > 0) return;

  const mockTournaments = [
    {
      id: "tournament_1",
      title: "Rune Masters Championship 2025",
      game: "Force of Rune",
      date: "2025-10-20",
      time: "18:00",
      maxPlayers: 100,
      prizePoolType: "fixed",
      prizePool: 50000,
      prizeSplit: { first: 50, second: 30, third: 20 },
      rules:
        "No cheating, No teaming, Fair play only. Winners will be selected based on final ranking.",
      hostId: "host1",
      participants: ["player1", "player2", "player3", "player4"],
      winners: null,
      status: "upcoming",
      createdAt: "2025-10-10T10:00:00.000Z",
      image: "🎮",
    },
    {
      id: "tournament_2",
      title: "Runic Warriors League",
      game: "Force of Rune",
      date: "2025-10-15",
      time: "20:00",
      maxPlayers: 50,
      prizePoolType: "entry-based",
      prizePool: 30000,
      prizeSplit: { first: 50, second: 30, third: 20 },
      rules:
        "Tournament format: Team Battle. All character classes allowed. No exploits.",
      hostId: "host2",
      participants: ["player1", "player3"],
      winners: null,
      status: "ongoing",
      createdAt: "2025-10-08T10:00:00.000Z",
      image: "🔥",
    },
    {
      id: "tournament_3",
      title: "Force of Rune Grand Masters",
      game: "Force of Rune",
      date: "2025-10-25",
      time: "19:00",
      maxPlayers: 64,
      prizePoolType: "entry-based",
      prizePool: 75000,
      prizeSplit: { first: 50, second: 30, third: 20 },
      rules: "Best of 5 matches. All maps in rotation. Fair play enforced.",
      hostId: "host1",
      participants: ["player2", "player4"],
      winners: null,
      status: "upcoming",
      createdAt: "2025-10-09T10:00:00.000Z",
      image: "⚔️",
    },
    {
      id: "tournament_4",
      title: "Rune Legends Showdown",
      game: "Force of Rune",
      date: "2025-10-05",
      time: "17:00",
      maxPlayers: 32,
      prizePoolType: "fixed",
      prizePool: 40000,
      prizeSplit: { first: 50, second: 30, third: 20 },
      rules:
        "Solo matches. Skill-based matchmaking. Standard tournament rules apply.",
      hostId: "host2",
      participants: ["player1", "player2", "player3"],
      winners: {
        first: "player1",
        second: "player2",
        third: "player3",
      },
      status: "completed",
      createdAt: "2025-09-25T10:00:00.000Z",
      image: "🎯",
    },
    {
      id: "tournament_5",
      title: "Ancient Runes Battle Arena",
      game: "Force of Rune",
      date: "2025-10-18",
      time: "21:00",
      maxPlayers: 60,
      prizePoolType: "entry-based",
      prizePool: 60000,
      prizeSplit: { first: 50, second: 30, third: 20 },
      rules: "Team mode. All abilities unlocked. No camping allowed.",
      hostId: "host1",
      participants: ["player4"],
      winners: null,
      status: "upcoming",
      createdAt: "2025-10-07T10:00:00.000Z",
      image: "🏆",
    },
  ];

  localStorage.setItem(
    STORAGE_KEYS.TOURNAMENTS,
    JSON.stringify(mockTournaments)
  );

  // Add some mock transactions for completed tournament
  const mockTransactions = [
    {
      id: "tx_1",
      userId: "player1",
      type: "prize_won",
      amount: 20000,
      description: "🥇 1st Place in Valorant Showdown",
      tournamentId: "tournament_4",
      timestamp: "2025-10-05T22:00:00.000Z",
    },
    {
      id: "tx_2",
      userId: "player2",
      type: "prize_won",
      amount: 12000,
      description: "🥈 2nd Place in Valorant Showdown",
      tournamentId: "tournament_4",
      timestamp: "2025-10-05T22:00:00.000Z",
    },
    {
      id: "tx_3",
      userId: "player3",
      type: "prize_won",
      amount: 8000,
      description: "🥉 3rd Place in Valorant Showdown",
      tournamentId: "tournament_4",
      timestamp: "2025-10-05T22:00:00.000Z",
    },
    {
      id: "tx_4",
      userId: "host1",
      type: "tournament_creation",
      amount: -500,
      description: "Created tournament: BGMI Championship 2025",
      tournamentId: "tournament_1",
      timestamp: "2025-10-10T10:00:00.000Z",
    },
    {
      id: "tx_5",
      userId: "host2",
      type: "tournament_creation",
      amount: -500,
      description: "Created tournament: Free Fire Pro League",
      tournamentId: "tournament_2",
      timestamp: "2025-10-08T10:00:00.000Z",
    },
  ];

  localStorage.setItem(
    STORAGE_KEYS.TRANSACTIONS,
    JSON.stringify(mockTransactions)
  );
};
