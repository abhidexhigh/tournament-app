// Clan management utilities

// Get all clans
export const getAllClans = () => {
  if (typeof window === "undefined") return [];
  const clans = localStorage.getItem("clans");
  return clans ? JSON.parse(clans) : [];
};

// Get clan by ID
export const getClanById = (id) => {
  const clans = getAllClans();
  return clans.find((c) => c.id === id);
};

// Get clan by name
export const getClanByName = (name) => {
  const clans = getAllClans();
  return clans.find((c) => c.name === name);
};

// Get user's clan
export const getUserClan = (userId) => {
  if (typeof window === "undefined") return null;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.id === userId);

  if (!user || !user.clan_id) return null;

  return getClanById(user.clan_id);
};

// Check if user is member of a specific clan
export const isUserMemberOfClan = (userId, clanId) => {
  const userClan = getUserClan(userId);
  return userClan && userClan.id === clanId;
};

// Get clan members
export const getClanMembers = (clanId) => {
  if (typeof window === "undefined") return [];

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  return users.filter((u) => u.clan_id === clanId);
};

// Check if user can join clan battle tournament
export const canUserJoinClanBattle = (userId, tournament) => {
  if (tournament.tournament_type !== "clan_battle") return true;

  if (tournament.clan_battle_mode === "auto_division") {
    return true; // Anyone can join auto-division
  }

  if (tournament.clan_battle_mode === "clan_selection") {
    const userClan = getUserClan(userId);
    if (!userClan) return false;

    // Check if user's clan is one of the selected clans
    return (
      userClan.id === tournament.clan1_id || userClan.id === tournament.clan2_id
    );
  }

  return false;
};

// Get clan options for dropdown
export const getClanOptions = () => {
  const clans = getAllClans();
  return clans.map((clan) => ({
    value: clan.id,
    label: `${clan.emblem} ${clan.name} [${clan.tag}]`,
    clan: clan,
  }));
};

// Initialize clans data if not exists
export const initializeClans = () => {
  if (typeof window === "undefined") return;

  const existingClans = localStorage.getItem("clans");
  if (!existingClans) {
    // Load from JSON file (in real app, this would be from API)
    const clansData = [
      {
        id: "clan_1",
        name: "Dragon Warriors",
        tag: "DW",
        description: "Elite warriors who fight with honor and courage",
        members: ["player1", "player2", "player3"],
        leader: "player1",
        created_at: "2025-01-01T00:00:00.000Z",
        level: 15,
        wins: 45,
        losses: 12,
        color: "#FF6B35",
        emblem: "🐉",
      },
      {
        id: "clan_2",
        name: "Shadow Lords",
        tag: "SL",
        description: "Masters of stealth and strategy",
        members: ["player4", "player5"],
        leader: "player4",
        created_at: "2025-01-02T00:00:00.000Z",
        level: 12,
        wins: 38,
        losses: 8,
        color: "#8B5CF6",
        emblem: "🌙",
      },
      {
        id: "clan_3",
        name: "Thunder Bolts",
        tag: "TB",
        description: "Lightning-fast warriors with electric power",
        members: ["player6", "player7", "player8", "player9"],
        leader: "player6",
        created_at: "2025-01-03T00:00:00.000Z",
        level: 18,
        wins: 52,
        losses: 15,
        color: "#F59E0B",
        emblem: "⚡",
      },
      {
        id: "clan_4",
        name: "Ice Guardians",
        tag: "IG",
        description: "Defenders of the frozen realm",
        members: ["player10", "player11"],
        leader: "player10",
        created_at: "2025-01-04T00:00:00.000Z",
        level: 10,
        wins: 28,
        losses: 6,
        color: "#06B6D4",
        emblem: "❄️",
      },
      {
        id: "clan_5",
        name: "Flame Phoenix",
        tag: "FP",
        description: "Rising from ashes, stronger than before",
        members: ["player12", "player13", "player14"],
        leader: "player12",
        created_at: "2025-01-05T00:00:00.000Z",
        level: 14,
        wins: 41,
        losses: 9,
        color: "#EF4444",
        emblem: "🔥",
      },
      {
        id: "clan_6",
        name: "Storm Riders",
        tag: "SR",
        description: "Riding the winds of change and chaos",
        members: ["player15", "player16", "player17", "player18"],
        leader: "player15",
        created_at: "2025-01-06T00:00:00.000Z",
        level: 16,
        wins: 47,
        losses: 11,
        color: "#10B981",
        emblem: "🌪️",
      },
    ];

    localStorage.setItem("clans", JSON.stringify(clansData));
  }
};
