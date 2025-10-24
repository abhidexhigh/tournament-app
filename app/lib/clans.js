// Clan management utilities

// Get all clans
export const getAllClans = () => {
  if (typeof window === "undefined") return [];

  // Always return hardcoded clan data (in a real app, this would be an API call)
  const clansData = [
    {
      id: "clan_1",
      name: "Dragon Warriors",
      tag: "DW",
      emblem: "🐉",
      description: "An elite clan of fierce warriors.",
      level: 10,
      wins: 150,
      losses: 50,
      members: ["player1", "player2", "player3"],
    },
    {
      id: "clan_2",
      name: "Shadow Lords",
      tag: "SL",
      emblem: "🌙",
      description: "Masters of stealth and cunning tactics.",
      level: 9,
      wins: 120,
      losses: 60,
      members: ["player4", "player5"],
    },
    {
      id: "clan_3",
      name: "Thunder Bolts",
      tag: "TB",
      emblem: "⚡",
      description: "Lightning-fast and aggressive players.",
      level: 8,
      wins: 100,
      losses: 40,
      members: ["player6", "player7"],
    },
    {
      id: "clan_4",
      name: "Ice Guardians",
      tag: "IG",
      emblem: "❄️",
      description: "Defenders of the frozen realm, unyielding in battle.",
      level: 7,
      wins: 90,
      losses: 30,
      members: ["player8"],
    },
    {
      id: "clan_5",
      name: "Flame Phoenix",
      tag: "FP",
      emblem: "🔥",
      description: "Rising from the ashes, a clan of fiery determination.",
      level: 8,
      wins: 110,
      losses: 45,
      members: ["player9"],
    },
    {
      id: "clan_6",
      name: "Storm Riders",
      tag: "SR",
      emblem: "🌪️",
      description: "Riding the winds of change, unpredictable and powerful.",
      level: 9,
      wins: 130,
      losses: 55,
      members: ["player10"],
    },
  ];

  return clansData;
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

// Get user's clans (multiple memberships)
export const getUserClans = (userId) => {
  if (typeof window === "undefined") return [];

  // Fetch user data directly from JSON file instead of localStorage
  const fetchUserData = async () => {
    try {
      const response = await fetch("/data/users.json");
      const users = await response.json();
      return users.find((u) => u.id === userId);
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // For now, we'll use a synchronous approach by importing the data
  // In a real app, this would be an API call
  const users = [
    {
      id: "player1",
      username: "ShadowNinja",
      email: "shadow@player.com",
      type: "player",
      diamonds: 800,
      avatar: "🥷",
      gameId: "ShadowNinja#9999",
      rank: "Gold",
      clans: [
        {
          clan_id: "clan_1",
          role: "leader",
          joined_at: "2025-01-01T00:00:00.000Z",
        },
        {
          clan_id: "clan_3",
          role: "member",
          joined_at: "2025-02-15T00:00:00.000Z",
        },
      ],
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-10-17T07:19:38.281Z",
    },
    // Add other users as needed
  ];

  const user = users.find((u) => u.id === userId);

  if (!user || !user.clans || user.clans.length === 0) return [];

  return user.clans
    .map((clanMembership) => {
      const clanData = getClanById(clanMembership.clan_id);
      return {
        ...clanData,
        role: clanMembership.role,
        joined_at: clanMembership.joined_at,
      };
    })
    .filter((clan) => clan.id); // Filter out null clans
};

// Get user's primary clan (first clan or leader clan)
export const getUserPrimaryClan = (userId) => {
  const userClans = getUserClans(userId);
  if (userClans.length === 0) return null;

  // Return leader clan if exists, otherwise first clan
  const leaderClan = userClans.find((clan) => clan.role === "leader");
  return leaderClan || userClans[0];
};

// Get user's clan (backward compatibility)
export const getUserClan = (userId) => {
  return getUserPrimaryClan(userId);
};

// Check if user is member of a specific clan
export const isUserMemberOfClan = (userId, clanId) => {
  const userClans = getUserClans(userId);
  return userClans.some((clan) => clan.id === clanId);
};

// Get clan members
export const getClanMembers = (clanId) => {
  if (typeof window === "undefined") return [];

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  return users.filter(
    (u) => u.clans && u.clans.some((clan) => clan.clan_id === clanId)
  );
};

// Check if user can join clan battle tournament
export const canUserJoinClanBattle = (userId, tournament) => {
  if (tournament.tournament_type !== "clan_battle") return true;

  if (tournament.clan_battle_mode === "auto_division") {
    return true; // Anyone can join auto-division
  }

  if (tournament.clan_battle_mode === "clan_selection") {
    const userClans = getUserClans(userId);
    if (userClans.length === 0) return false;

    // Check if user is member of any of the selected clans
    return userClans.some(
      (clan) =>
        clan.id === tournament.clan1_id || clan.id === tournament.clan2_id
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
  // Clans are now loaded directly from hardcoded data
};
