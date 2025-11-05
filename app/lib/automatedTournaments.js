// Automated Tournament System for Force of Rune
// Auto-creates tournaments at specified intervals

const AUTOMATED_LEVELS = {
  gold: {
    name: "Gold",
    interval: 1 * 60 * 60 * 1000, // 1 hour in milliseconds
    duration: 1 * 60 * 60 * 1000, // 1 hour
    entryFeeUsd: 0.1,
    entryFeeDiamonds: 10, // $0.1 = 10 diamonds (assuming 1 diamond = $0.01)
    prizePoolMultiplier: 100, // Prize pool = entry fee × 100
    maxPlayers: 100,
    minRank: "Gold",
    icon: "🥇",
  },
  platinum: {
    name: "Platinum",
    interval: 2 * 60 * 60 * 1000, // 2 hours
    duration: 2 * 60 * 60 * 1000, // 2 hours
    entryFeeUsd: 1,
    entryFeeDiamonds: 100,
    prizePoolMultiplier: 100,
    maxPlayers: 100,
    minRank: "Platinum",
    icon: "🥈",
  },
  diamond: {
    name: "Diamond",
    interval: 8 * 60 * 60 * 1000, // 8 hours
    duration: 8 * 60 * 60 * 1000, // 8 hours
    entryFeeUsd: 2,
    entryFeeDiamonds: 200,
    prizePoolMultiplier: 100,
    maxPlayers: 100,
    minRank: "Diamond",
    icon: "💎",
  },
  master: {
    name: "Master",
    interval: 24 * 60 * 60 * 1000, // 24 hours
    duration: 24 * 60 * 60 * 1000, // 24 hours
    entryFeeUsd: 10,
    entryFeeDiamonds: 1000,
    prizePoolMultiplier: 100,
    maxPlayers: 100,
    minRank: "Master",
    icon: "👑",
  },
};

// Prize distribution percentages
const PRIZE_DISTRIBUTION = {
  first: 50, // 50%
  second: 30, // 30%
  third: 20, // 20%
};

/**
 * Get configuration for a specific level
 */
export const getLevelConfig = (level) => {
  return AUTOMATED_LEVELS[level.toLowerCase()];
};

/**
 * Get all automated levels
 */
export const getAllLevels = () => {
  return Object.keys(AUTOMATED_LEVELS);
};

/**
 * Calculate when the next tournament should be created
 */
export const calculateNextTournamentTime = (level) => {
  const config = getLevelConfig(level);
  if (!config) return null;

  const now = new Date();
  const nextTime = new Date(now.getTime() + config.interval);
  return nextTime;
};

/**
 * Calculate when a tournament should expire
 */
export const calculateExpiryTime = (startTime, level) => {
  const config = getLevelConfig(level);
  if (!config) return null;

  const start = new Date(startTime);
  const expiryTime = new Date(start.getTime() + config.duration);
  return expiryTime;
};

/**
 * Format tournament title
 */
export const formatTournamentTitle = (level) => {
  const config = getLevelConfig(level);
  if (!config) return "";

  return `${config.icon} ${config.name} Match - Auto`;
};

/**
 * Check if there's an active automated tournament for this level
 */
export const hasActiveTournament = async (level, pool) => {
  const now = new Date();

  const result = await pool.query(
    `SELECT id FROM tournaments 
     WHERE is_automated = true 
     AND automated_level = $1 
     AND status IN ('upcoming', 'ongoing')
     AND (expires_at IS NULL OR expires_at > $2)
     LIMIT 1`,
    [level, now]
  );

  return result.rows.length > 0;
};

/**
 * Create automated tournament data object
 */
export const createAutomatedTournamentData = (
  level,
  startTime = new Date()
) => {
  const config = getLevelConfig(level);
  if (!config) return null;

  const expiryTime = calculateExpiryTime(startTime, level);
  const prizePoolUsd = config.entryFeeUsd * config.prizePoolMultiplier;
  const prizePoolDiamonds =
    config.entryFeeDiamonds * config.prizePoolMultiplier;

  // Format date and time
  const date = startTime.toISOString().split("T")[0]; // YYYY-MM-DD
  const hours = String(startTime.getHours()).padStart(2, "0");
  const minutes = String(startTime.getMinutes()).padStart(2, "0");
  const time = `${hours}:${minutes}`;

  return {
    id: `auto_${level}_${Date.now()}`,
    title: formatTournamentTitle(level),
    game: "Force of Rune",
    tournament_type: "regular",
    date,
    time,
    max_players: config.maxPlayers,
    min_rank: config.minRank,
    prize_pool_type: "entry-based",
    prize_pool: prizePoolDiamonds, // in diamonds
    prize_pool_usd: prizePoolUsd,
    prize_split_first: PRIZE_DISTRIBUTION.first,
    prize_split_second: PRIZE_DISTRIBUTION.second,
    prize_split_third: PRIZE_DISTRIBUTION.third,
    entry_fee: config.entryFeeDiamonds,
    entry_fee_usd: config.entryFeeUsd,
    rules: `This is an automated ${
      config.name
    } level tournament. Only players with ${
      config.minRank
    } rank or higher can join. Tournament duration: ${
      config.duration / (60 * 60 * 1000)
    } hour(s).`,
    image: config.icon,
    host_id: "game_owner_admin",
    participants: [],
    status: "upcoming",
    is_automated: true,
    automated_level: level,
    expires_at: expiryTime.toISOString(),
    accepts_tickets: false,
  };
};

/**
 * Create an automated tournament in the database
 */
export const createAutomatedTournament = async (level, pool) => {
  // Check if there's already an active tournament for this level
  const hasActive = await hasActiveTournament(level, pool);
  if (hasActive) {
    return {
      success: false,
      message: `Active ${level} tournament already exists`,
    };
  }

  const tournamentData = createAutomatedTournamentData(level);
  if (!tournamentData) {
    return { success: false, message: "Invalid level" };
  }

  try {
    const result = await pool.query(
      `INSERT INTO tournaments (
        id, title, game, tournament_type, date, time, max_players, min_rank,
        prize_pool_type, prize_pool, prize_pool_usd, prize_split_first, 
        prize_split_second, prize_split_third, entry_fee, entry_fee_usd, rules,
        image, host_id, participants, status, is_automated, automated_level, expires_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24
      ) RETURNING id`,
      [
        tournamentData.id,
        tournamentData.title,
        tournamentData.game,
        tournamentData.tournament_type,
        tournamentData.date,
        tournamentData.time,
        tournamentData.max_players,
        tournamentData.min_rank,
        tournamentData.prize_pool_type,
        tournamentData.prize_pool,
        tournamentData.prize_pool_usd,
        tournamentData.prize_split_first,
        tournamentData.prize_split_second,
        tournamentData.prize_split_third,
        tournamentData.entry_fee,
        tournamentData.entry_fee_usd,
        tournamentData.rules,
        tournamentData.image,
        tournamentData.host_id,
        tournamentData.participants,
        tournamentData.status,
        tournamentData.is_automated,
        tournamentData.automated_level,
        tournamentData.expires_at,
      ]
    );

    return {
      success: true,
      message: `${level} tournament created successfully`,
      tournamentId: result.rows[0].id,
    };
  } catch (error) {
    console.error("Error creating automated tournament:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Expire old automated tournaments
 */
export const expireOldTournaments = async (pool) => {
  const now = new Date();

  try {
    const result = await pool.query(
      `UPDATE tournaments 
       SET status = 'completed'
       WHERE is_automated = true 
       AND status IN ('upcoming', 'ongoing')
       AND expires_at IS NOT NULL 
       AND expires_at <= $1
       RETURNING id, automated_level`,
      [now]
    );

    return {
      success: true,
      expiredCount: result.rows.length,
      expired: result.rows,
    };
  } catch (error) {
    console.error("Error expiring tournaments:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Update tournament status based on time
 */
export const updateTournamentStatuses = async (pool) => {
  const now = new Date();

  try {
    // Update upcoming to ongoing
    await pool.query(
      `UPDATE tournaments 
       SET status = 'ongoing'
       WHERE is_automated = true 
       AND status = 'upcoming'
       AND CONCAT(date, ' ', time)::timestamp <= $1
       AND (expires_at IS NULL OR expires_at > $1)`,
      [now]
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating tournament statuses:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Run the automated tournament scheduler
 * This should be called periodically (e.g., every 5 minutes)
 */
export const runScheduler = async (pool) => {
  const results = [];

  // First, expire old tournaments
  const expireResult = await expireOldTournaments(pool);
  results.push({ action: "expire", ...expireResult });

  // Update statuses
  await updateTournamentStatuses(pool);

  // For each level, check if we need to create a new tournament
  const levels = getAllLevels();

  for (const level of levels) {
    const hasActive = await hasActiveTournament(level, pool);

    if (!hasActive) {
      const createResult = await createAutomatedTournament(level, pool);
      results.push({ action: "create", level, ...createResult });
    }
  }

  return results;
};

export { AUTOMATED_LEVELS, PRIZE_DISTRIBUTION };
