// Automated Tournament System for Force of Rune
// Auto-creates tournaments at specified intervals

import { CONVERSION_RATE } from "./currencyConfig";
import { usersDb, transactionsDb } from "./database";

const AUTOMATED_LEVELS = {
  gold: {
    name: "Gold",
    schedule: "hourly",
    scheduleType: "hourly",
    duration: 1 * 60 * 60 * 1000, // 1 hour duration
    entryFeeUsd: 0, // Free entry
    entryFeeDiamonds: 0 * CONVERSION_RATE.USD_TO_DIAMOND,
    prizePoolType: "fixed",
    prizePoolMultiplier: CONVERSION_RATE.USD_TO_DIAMOND,
    fixedPrizePoolUsd: 0, // Free tournament
    fixedPrizePoolDiamonds: 0 * CONVERSION_RATE.USD_TO_DIAMOND,
    maxPlayers: 100,
    minRank: "Gold",
    icon: "🥇",
  },
  platinum: {
    name: "Platinum",
    schedule: ["19:30", "20:30", "21:30"], // 7:30 PM, 8:30 PM, 9:30 PM
    scheduleType: "fixed",
    duration: 1 * 60 * 60 * 1000, // 1 hour duration
    entryFeeUsd: 1,
    entryFeeDiamonds: 1 * CONVERSION_RATE.USD_TO_DIAMOND,
    prizePoolType: "fixed",
    prizePoolMultiplier: CONVERSION_RATE.USD_TO_DIAMOND,
    fixedPrizePoolUsd: 100, // $100 prize pool
    fixedPrizePoolDiamonds: 100 * CONVERSION_RATE.USD_TO_DIAMOND,
    maxPlayers: 100,
    minRank: "Platinum",
    icon: "🥈",
  },
  diamond: {
    name: "Diamond",
    schedule: ["20:00", "22:00"], // 8:00 PM and 10:00 PM
    scheduleType: "fixed",
    duration: 2 * 60 * 60 * 1000, // 2 hours duration
    entryFeeUsd: 2,
    entryFeeDiamonds: 2 * CONVERSION_RATE.USD_TO_DIAMOND,
    prizePoolType: "fixed",
    prizePoolMultiplier: CONVERSION_RATE.USD_TO_DIAMOND,
    fixedPrizePoolUsd: 200, // $200 prize pool
    fixedPrizePoolDiamonds: 200 * CONVERSION_RATE.USD_TO_DIAMOND,
    maxPlayers: 100,
    minRank: "Diamond",
    icon: "💎",
  },
  master: {
    name: "Master",
    schedule: ["21:00"], // 9:00 PM
    scheduleType: "fixed",
    duration: 3 * 60 * 60 * 1000, // 3 hours duration
    entryFeeUsd: 10,
    entryFeeDiamonds: 10 * CONVERSION_RATE.USD_TO_DIAMOND,
    prizePoolType: "fixed",
    prizePoolMultiplier: CONVERSION_RATE.USD_TO_DIAMOND,
    fixedPrizePoolUsd: 1000, // $1000 prize pool
    fixedPrizePoolDiamonds: 1000 * CONVERSION_RATE.USD_TO_DIAMOND,
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
 * Get next scheduled time for a tournament level
 */
export const getNextScheduledTime = (level) => {
  const config = getLevelConfig(level);
  if (!config) return null;

  const now = new Date();

  if (config.scheduleType === "minutely") {
    // Next minute
    const nextMinute = new Date(now);
    nextMinute.setMinutes(now.getMinutes() + 1);
    nextMinute.setSeconds(0);
    nextMinute.setMilliseconds(0);
    return nextMinute;
  }

  if (config.scheduleType === "hourly") {
    // Next hour on the hour (e.g., if now is 10:30, next is 11:00)
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1);
    nextHour.setMinutes(0);
    nextHour.setSeconds(0);
    nextHour.setMilliseconds(0);
    return nextHour;
  }

  if (config.scheduleType === "fixed") {
    // Find the next scheduled time for today or tomorrow
    const times = config.schedule;
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const timeStr of times) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const scheduledMinutes = hours * 60 + minutes;

      if (scheduledMinutes > currentTime) {
        const nextTime = new Date(now);
        nextTime.setHours(hours);
        nextTime.setMinutes(minutes);
        nextTime.setSeconds(0);
        nextTime.setMilliseconds(0);
        return nextTime;
      }
    }

    // If no time today, get first time tomorrow
    const [hours, minutes] = times[0].split(":").map(Number);
    const nextTime = new Date(now);
    nextTime.setDate(nextTime.getDate() + 1);
    nextTime.setHours(hours);
    nextTime.setMinutes(minutes);
    nextTime.setSeconds(0);
    nextTime.setMilliseconds(0);
    return nextTime;
  }

  return null;
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

  return `${config.name} League`;
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
    [level, now],
  );

  return result.rows.length > 0;
};

/**
 * Check if it's time to create a tournament for this level
 */
export const shouldCreateTournament = (level) => {
  const config = getLevelConfig(level);
  if (!config) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (config.scheduleType === "minutely") {
    // Create every minute (cron runs every minute)
    return true;
  }

  if (config.scheduleType === "hourly") {
    // Create at the start of every hour (XX:00)
    // Allow 5-minute window to handle scheduler delays (XX:00 to XX:05)
    return now.getMinutes() >= 0 && now.getMinutes() <= 5;
  }

  if (config.scheduleType === "fixed") {
    // Check if current time matches any scheduled time
    for (const timeStr of config.schedule) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const scheduledMinutes = hours * 60 + minutes;

      // Within 5-minute window to handle scheduler delays
      if (Math.abs(currentMinutes - scheduledMinutes) <= 5) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Create automated tournament data object
 */
export const createAutomatedTournamentData = (
  level,
  startTime = new Date(),
) => {
  const config = getLevelConfig(level);
  if (!config) return null;

  const expiryTime = calculateExpiryTime(startTime, level);

  // Use fixed prize pool if defined, otherwise calculate based on entry fee
  const prizePoolUsd =
    config.fixedPrizePoolUsd !== undefined
      ? config.fixedPrizePoolUsd
      : config.entryFeeUsd * config.prizePoolMultiplier;
  const prizePoolDiamonds =
    config.fixedPrizePoolDiamonds !== undefined
      ? config.fixedPrizePoolDiamonds
      : config.entryFeeDiamonds * config.prizePoolMultiplier;

  // Format date and time
  const date = startTime.toISOString().split("T")[0]; // YYYY-MM-DD
  const hours = String(startTime.getHours()).padStart(2, "0");
  const minutes = String(startTime.getMinutes()).padStart(2, "0");
  const time = `${hours}:${minutes}`;

  const durationHours = config.duration / (60 * 60 * 1000);
  const durationMinutes = config.duration / (60 * 1000);
  let scheduleInfo = "";
  if (config.scheduleType === "minutely") {
    scheduleInfo = "Created every minute (for testing).";
  } else if (config.scheduleType === "hourly") {
    scheduleInfo = "Created every hour on the hour.";
  } else {
    scheduleInfo = `Scheduled at: ${config.schedule.join(", ")}`;
  }

  return {
    id: `auto_${level}_${Date.now()}`,
    title: formatTournamentTitle(level),
    game: "Force of Rune",
    tournament_type: "regular",
    date,
    time,
    max_players: config.maxPlayers,
    min_rank: config.minRank,
    prize_pool_type: config.prizePoolType,
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
    } rank or higher can join. Duration: ${
      config.scheduleType === "minutely"
        ? `${durationMinutes} minute(s)`
        : `${durationHours} hour(s)`
    }. ${scheduleInfo}`,
    image: config.icon,
    host_id: "game_owner_admin",
    participants: [],
    status: "upcoming",
    is_automated: true,
    automated_level: level,
    expires_at: expiryTime.toISOString(),
    accepts_tickets: true, // Tournaments must accept tickets
    display_type: "tournament", // Auto-created matches are "Tournaments"
  };
};

/**
 * Create an automated tournament in the database
 */
export const createAutomatedTournament = async (
  level,
  pool,
  startTime = null,
) => {
  // Check if there's already an active tournament for this level
  const hasActive = await hasActiveTournament(level, pool);
  if (hasActive) {
    return {
      success: false,
      message: `Active ${level} tournament already exists`,
    };
  }

  const config = getLevelConfig(level);

  // If no startTime provided, normalize based on schedule type
  let normalizedStartTime = startTime;
  if (!startTime) {
    normalizedStartTime = new Date();
    if (config.scheduleType === "minutely") {
      // Normalize to current minute
      normalizedStartTime.setSeconds(0);
      normalizedStartTime.setMilliseconds(0);
    } else if (config.scheduleType === "hourly") {
      // Normalize to top of current hour
      normalizedStartTime.setMinutes(0);
      normalizedStartTime.setSeconds(0);
      normalizedStartTime.setMilliseconds(0);
    }
  }

  const tournamentData = createAutomatedTournamentData(
    level,
    normalizedStartTime,
  );
  if (!tournamentData) {
    return { success: false, message: "Invalid level" };
  }

  try {
    const result = await pool.query(
      `INSERT INTO tournaments (
          id, title, game, tournament_type, date, time, max_players, min_rank,
          prize_pool_type, prize_pool, prize_pool_usd, prize_split_first, 
          prize_split_second, prize_split_third, entry_fee, entry_fee_usd, rules,
          image, host_id, participants, status, is_automated, automated_level, expires_at, display_type, accepts_tickets
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23, $24, $25, $26
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
        tournamentData.display_type,
        tournamentData.accepts_tickets,
      ],
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
 * Create an automated tournament for the NEXT scheduled time
 * Used for manual triggers to create upcoming matches
 */
export const createNextScheduledTournament = async (level, pool) => {
  // Check if there's already an active tournament for this level
  const hasActive = await hasActiveTournament(level, pool);
  if (hasActive) {
    return {
      success: false,
      message: `Active ${level} tournament already exists`,
    };
  }

  // Get next scheduled time for this level
  const nextTime = getNextScheduledTime(level);
  if (!nextTime) {
    return {
      success: false,
      message: "Unable to determine next scheduled time",
    };
  }

  const config = getLevelConfig(level);
  const now = new Date();

  console.log(
    `[Manual Create] ${level}: Next scheduled at ${nextTime.toISOString()} (${nextTime.toLocaleTimeString()})`,
  );

  // Create tournament for the next scheduled time
  const tournamentData = createAutomatedTournamentData(level, nextTime);
  if (!tournamentData) {
    return { success: false, message: "Invalid level" };
  }

  try {
    const result = await pool.query(
      `INSERT INTO tournaments (
          id, title, game, tournament_type, date, time, max_players, min_rank,
          prize_pool_type, prize_pool, prize_pool_usd, prize_split_first, 
          prize_split_second, prize_split_third, entry_fee, entry_fee_usd, rules,
          image, host_id, participants, status, is_automated, automated_level, expires_at, display_type, accepts_tickets
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23, $24, $25, $26
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
        tournamentData.display_type,
        tournamentData.accepts_tickets,
      ],
    );

    return {
      success: true,
      message: `${level} tournament created for ${nextTime.toLocaleTimeString()}`,
      tournamentId: result.rows[0].id,
      scheduledTime: nextTime.toISOString(),
    };
  } catch (error) {
    console.error("Error creating next scheduled tournament:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Cancel unfilled tournaments and refund participants
 * This is called when joining time ends but tournament is not full (participants < max_players)
 */
export const cancelUnfilledTournaments = async (pool) => {
  const now = new Date();

  try {
    // Find tournaments that:
    // 1. Have expired (joining time ended)
    // 2. Are not full (participants count < max_players)
    // 3. Are still in 'upcoming' or 'ongoing' status
    const unfilledResult = await pool.query(
      `SELECT id, title, participants, max_players, entry_fee, entry_fee_usd, automated_level
       FROM tournaments 
       WHERE status IN ('upcoming', 'ongoing')
       AND expires_at IS NOT NULL 
       AND expires_at <= $1
       AND array_length(participants, 1) IS DISTINCT FROM max_players`,
      [now],
    );

    const cancelledTournaments = [];
    const refundedParticipants = [];

    for (const tournament of unfilledResult.rows) {
      const participantCount = tournament.participants?.length || 0;
      const maxPlayers = tournament.max_players;

      // Only cancel if not full (participants < max_players)
      if (participantCount < maxPlayers && participantCount > 0) {
        console.log(
          `[Scheduler] Cancelling unfilled tournament: ${tournament.title} (${participantCount}/${maxPlayers} players)`,
        );

        // Refund each participant
        for (const participantId of tournament.participants) {
          try {
            // Find the original entry transaction for this participant
            const transactionResult = await pool.query(
              `SELECT * FROM transactions 
               WHERE tournament_id = $1 
               AND user_id = $2 
               AND type = 'tournament_entry'
               ORDER BY created_at DESC 
               LIMIT 1`,
              [tournament.id, participantId],
            );

            const originalTransaction = transactionResult.rows[0];

            if (originalTransaction) {
              const refundAmount = Math.abs(originalTransaction.amount);
              const currency = originalTransaction.currency || "diamonds";

              // Refund based on currency type
              if (currency === "usd") {
                // Refund USD
                const user = await usersDb.getById(participantId);
                if (user) {
                  const currentBalance = Number(
                    user.balance || user.usd_balance || 0,
                  );
                  await usersDb.update(participantId, {
                    usd_balance: currentBalance + refundAmount,
                  });
                }
              } else {
                // Refund diamonds (default)
                await usersDb.updateDiamonds(participantId, refundAmount);
              }

              // Create refund transaction record
              await transactionsDb.create({
                user_id: participantId,
                type: "tournament_refund",
                amount: refundAmount,
                description: `Refund for cancelled tournament: ${tournament.title} (not enough players joined)`,
                tournament_id: tournament.id,
                currency: currency,
              });

              refundedParticipants.push({
                participantId,
                tournamentId: tournament.id,
                refundAmount,
                currency,
              });

              console.log(
                `[Scheduler] Refunded ${refundAmount} ${currency} to user ${participantId}`,
              );
            }
          } catch (refundError) {
            console.error(
              `[Scheduler] Error refunding participant ${participantId}:`,
              refundError,
            );
          }
        }

        // Mark tournament as cancelled
        await pool.query(
          `UPDATE tournaments SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
          [tournament.id],
        );

        cancelledTournaments.push({
          id: tournament.id,
          title: tournament.title,
          participantCount,
          maxPlayers,
          level: tournament.automated_level,
        });
      } else if (participantCount === 0) {
        // No participants - just mark as cancelled, no refunds needed
        console.log(
          `[Scheduler] Cancelling empty tournament: ${tournament.title} (0/${maxPlayers} players)`,
        );

        await pool.query(
          `UPDATE tournaments SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
          [tournament.id],
        );

        cancelledTournaments.push({
          id: tournament.id,
          title: tournament.title,
          participantCount: 0,
          maxPlayers,
          level: tournament.automated_level,
        });
      }
    }

    return {
      success: true,
      cancelledCount: cancelledTournaments.length,
      cancelled: cancelledTournaments,
      refundedCount: refundedParticipants.length,
      refunded: refundedParticipants,
    };
  } catch (error) {
    console.error("Error cancelling unfilled tournaments:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Expire old automated tournaments (only full tournaments that completed successfully)
 */
export const expireOldTournaments = async (pool) => {
  const now = new Date();

  try {
    // Only expire tournaments that are FULL (participants = max_players)
    // Unfilled tournaments are handled by cancelUnfilledTournaments
    const result = await pool.query(
      `UPDATE tournaments 
       SET status = 'completed'
       WHERE is_automated = true 
       AND status IN ('upcoming', 'ongoing')
       AND expires_at IS NOT NULL 
       AND expires_at <= $1
       AND array_length(participants, 1) = max_players
       RETURNING id, automated_level`,
      [now],
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
      [now],
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating tournament statuses:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Run the automated tournament scheduler
 * This should be called periodically (every 1 minute recommended)
 */
export const runScheduler = async (pool) => {
  const results = [];
  const now = new Date();

  console.log(`[Scheduler] Running at ${now.toISOString()}`);

  // First, cancel unfilled tournaments and refund participants
  // This must run BEFORE expiring tournaments
  const cancelResult = await cancelUnfilledTournaments(pool);
  results.push({ action: "cancel_unfilled", ...cancelResult });

  if (cancelResult.cancelledCount > 0) {
    console.log(
      `[Scheduler] Cancelled ${cancelResult.cancelledCount} unfilled tournament(s), refunded ${cancelResult.refundedCount} participant(s)`,
    );
  }

  // Expire full tournaments that completed successfully
  const expireResult = await expireOldTournaments(pool);
  results.push({ action: "expire", ...expireResult });

  // Update statuses
  await updateTournamentStatuses(pool);

  // For each level, check if we should create a tournament
  const levels = getAllLevels();

  for (const level of levels) {
    // Check if there's already an active tournament
    const hasActive = await hasActiveTournament(level, pool);

    if (hasActive) {
      console.log(
        `[Scheduler] ${level}: Already has active tournament, skipping`,
      );
      continue;
    }

    // Check if it's time to create a tournament for this level
    const shouldCreate = shouldCreateTournament(level);

    if (shouldCreate) {
      console.log(`[Scheduler] ${level}: Time to create tournament`);
      const createResult = await createAutomatedTournament(level, pool);
      results.push({ action: "create", level, ...createResult });
    } else {
      console.log(`[Scheduler] ${level}: Not scheduled for this time`);
    }
  }

  return results;
};

/**
 * Run manual scheduler - creates tournaments for NEXT scheduled time
 * Used when admin clicks "Run Scheduler Now" button
 */
export const runManualScheduler = async (pool) => {
  const results = [];
  const now = new Date();

  console.log(`[Manual Scheduler] Running at ${now.toISOString()}`);
  console.log(
    `[Manual Scheduler] Creating tournaments for next scheduled times...`,
  );

  // First, cancel unfilled tournaments and refund participants
  const cancelResult = await cancelUnfilledTournaments(pool);
  results.push({ action: "cancel_unfilled", ...cancelResult });

  if (cancelResult.cancelledCount > 0) {
    console.log(
      `[Manual Scheduler] Cancelled ${cancelResult.cancelledCount} unfilled tournament(s), refunded ${cancelResult.refundedCount} participant(s)`,
    );
  }

  // Expire full tournaments that completed successfully
  const expireResult = await expireOldTournaments(pool);
  results.push({ action: "expire", ...expireResult });

  // Update statuses
  await updateTournamentStatuses(pool);

  // For each level, create tournament for next scheduled time
  const levels = getAllLevels();

  for (const level of levels) {
    console.log(`[Manual Scheduler] Processing ${level}...`);
    const createResult = await createNextScheduledTournament(level, pool);
    results.push({ action: "create", level, ...createResult });

    if (createResult.success) {
      console.log(`[Manual Scheduler] ✅ ${level}: ${createResult.message}`);
    } else {
      console.log(`[Manual Scheduler] ⚠️ ${level}: ${createResult.message}`);
    }
  }

  return results;
};

export { AUTOMATED_LEVELS, PRIZE_DISTRIBUTION };
