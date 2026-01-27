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

/**
 * Optimize Cloudinary URL with responsive sizing
 * Adds width, height, and quality transformations to reduce image size
 * @param {string} url - Original Cloudinary URL
 * @param {number} width - Desired width in pixels
 * @param {number} height - Desired height in pixels (optional, defaults to width)
 * @param {string} quality - Image quality (auto, auto:good, auto:best, etc.)
 * @returns {string} Optimized Cloudinary URL
 */
export function getOptimizedCloudinaryUrl(url, width, height = width, quality = "auto:good") {
  if (!url || !url.includes("res.cloudinary.com")) {
    return url;
  }

  // For retina displays, use 2x the display size
  const retinaWidth = width * 2;
  const retinaHeight = height * 2;

  // Insert transformation parameters after /upload/
  const transformation = `w_${retinaWidth},h_${retinaHeight},c_fit,q_${quality},f_auto`;
  
  // Handle URLs with or without existing version numbers
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;

  const baseUrl = url.substring(0, uploadIndex + 8); // includes "/upload/"
  const remainder = url.substring(uploadIndex + 8);

  return `${baseUrl}${transformation}/${remainder}`;
}

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
