// Utility function to select tournament icons programmatically
export function selectTournamentIcon(tournamentData) {
  const { title, prizePoolType, maxPlayers, entryFee } = tournamentData;

  // Icon selection based on tournament characteristics
  const iconRules = [
    // High prize pool tournaments
    {
      condition: (data) => data.prizePool >= 50000,
      icons: ["🏆", "👑", "💎", "⭐"],
    },
    // Large tournaments (many players)
    {
      condition: (data) => data.maxPlayers >= 100,
      icons: ["🎪", "🌍", "⚡", "🔥"],
    },
    // Entry-based tournaments
    {
      condition: (data) => data.prizePoolType === "entry-based",
      icons: ["📈", "💰", "🎯", "⚔️"],
    },
    // High entry fee tournaments
    {
      condition: (data) => data.entryFee >= 200,
      icons: ["💎", "👑", "🏆", "⭐"],
    },
    // Free tournaments
    {
      condition: (data) => data.entryFee === 0,
      icons: ["🎁", "🆓", "🎮", "🎪"],
    },
    // Championship/Masters tournaments
    {
      condition: (data) =>
        data.title.toLowerCase().includes("championship") ||
        data.title.toLowerCase().includes("masters") ||
        data.title.toLowerCase().includes("grand"),
      icons: ["🏆", "👑", "⭐", "💎"],
    },
    // Battle/Arena tournaments
    {
      condition: (data) =>
        data.title.toLowerCase().includes("battle") ||
        data.title.toLowerCase().includes("arena") ||
        data.title.toLowerCase().includes("war"),
      icons: ["⚔️", "🛡️", "🔥", "⚡"],
    },
    // Rune-themed tournaments
    {
      condition: (data) =>
        data.title.toLowerCase().includes("rune") ||
        data.title.toLowerCase().includes("mystic") ||
        data.title.toLowerCase().includes("ancient"),
      icons: ["🔮", "✨", "🌟", "💫"],
    },
  ];

  // Find the first matching rule
  for (const rule of iconRules) {
    if (rule.condition(tournamentData)) {
      // Select icon based on title hash for consistency
      const titleHash = hashString(title);
      const iconIndex = titleHash % rule.icons.length;
      return rule.icons[iconIndex];
    }
  }

  // Default icons if no rules match
  const defaultIcons = ["🎮", "🏆", "⚔️", "🔥", "🎯", "👾", "🎪", "⚡"];
  const titleHash = hashString(title);
  const iconIndex = titleHash % defaultIcons.length;
  return defaultIcons[iconIndex];
}

// Simple hash function for consistent icon selection
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Get icon for existing tournament (for backward compatibility)
export function getTournamentIcon(tournament) {
  // If tournament already has an icon, use it
  if (tournament.image) {
    return tournament.image;
  }

  // Otherwise, generate one based on tournament data
  return selectTournamentIcon({
    title: tournament.title,
    prizePoolType: tournament.prize_pool_type || tournament.prizePoolType,
    maxPlayers: tournament.max_players || tournament.maxPlayers,
    entryFee: tournament.entry_fee || tournament.entryFee,
    prizePool: tournament.prize_pool || tournament.prizePool,
  });
}
