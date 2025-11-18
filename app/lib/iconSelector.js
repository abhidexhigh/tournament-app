// Utility function to select tournament icons programmatically
export function selectTournamentIcon(tournamentData) {
  // Return the default game icon for all games
  return "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/Clan_battle_o3fmhe.webp";
}

// Default game icon for all games
const DEFAULT_GAME_ICON =
  "https://res.cloudinary.com/dg0cmj6su/image/upload/v1763459457/Clan_battle_o3fmhe.webp";

// Cloudinary image URLs for automated tournament levels
const AUTOMATED_LEVEL_IMAGES = {
  gold: "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747289695/Gold_Emblem_odau8h.webp",
  platinum:
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747289694/Platinum_Emblem_with_effect_ixwafm.webp",
  diamond:
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747289694/Diomond_Emblem_with_effect_g6lssd.webp",
  master:
    "https://res.cloudinary.com/dg0cmj6su/image/upload/v1747291235/Master_Emblem_with_effect_rd2xt6.webp",
};

// Get icon for existing tournament (for backward compatibility)
export function getTournamentIcon(tournament) {
  // Check if tournament has an automated_level and return corresponding image
  const automatedLevel =
    tournament.automated_level || tournament.automatedLevel;
  if (automatedLevel && AUTOMATED_LEVEL_IMAGES[automatedLevel.toLowerCase()]) {
    return AUTOMATED_LEVEL_IMAGES[automatedLevel.toLowerCase()];
  }

  // If tournament already has an icon (image URL), use it
  if (tournament.image && tournament.image.startsWith("http")) {
    return tournament.image;
  }

  // Use default game icon for all games
  return DEFAULT_GAME_ICON;
}
