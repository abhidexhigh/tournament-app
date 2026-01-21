// Database utilities using Vercel Postgres
// This replaces the JSON file-based storage with a real database

import { sql } from "@vercel/postgres";

// Prevent MaxListenersExceededWarning in development due to HMR
// This is a known Next.js development issue with database connections
if (process.env.NODE_ENV === "development") {
  const events = require("events");
  events.EventEmitter.defaultMaxListeners = 15;
}

// Export pool for compatibility with direct SQL queries
// The sql function acts as both a template tag and provides access to the connection pool
export const pool = {
  query: async (queryText, params = []) => {
    try {
      // Convert parameterized query to Vercel Postgres format
      if (params.length === 0) {
        return await sql.query(queryText);
      }
      return await sql.query(queryText, params);
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },
};

// Generate unique ID
export const generateId = (prefix = "") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get current timestamp
export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

// Helper function to transform user object from database format to application format
const transformUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    gameId: user.game_id, // Convert game_id to gameId
    game_id: undefined, // Remove the snake_case field
  };
};

// Users operations
export const usersDb = {
  getAll: async () => {
    try {
      const { rows } = await sql`SELECT * FROM users ORDER BY created_at DESC`;
      return rows.map(transformUser);
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const { rows } = await sql`SELECT * FROM users WHERE id = ${id}`;
      return transformUser(rows[0]);
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  },

  getByEmail: async (email) => {
    try {
      const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
      return transformUser(rows[0]);
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  },

  create: async (userData) => {
    try {
      // Validate clan membership: a user can only be in ONE clan
      const clans = userData.clans || [];
      if (Array.isArray(clans) && clans.length > 1) {
        throw new Error("A user can only be part of one clan at a time");
      }

      const newUser = {
        id: generateId("user"),
        username: userData.username,
        email: userData.email,
        type: userData.type,
        diamonds: userData.diamonds || 0,
        avatar: userData.avatar || "🎮",
        game_id: userData.gameId || null,
        rank: userData.rank || null,
        clans: JSON.stringify(clans),
        usd_balance: userData.usd_balance || 0,
        tickets: JSON.stringify(
          userData.tickets || {
            ticket_010: 0,
            ticket_100: 0,
            ticket_1000: 0,
          },
        ),
      };

      const { rows } = await sql`
        INSERT INTO users (
          id, username, email, type, diamonds, avatar, 
          game_id, rank, clans, usd_balance, tickets
        )
        VALUES (
          ${newUser.id}, ${newUser.username}, ${newUser.email}, 
          ${newUser.type}, ${newUser.diamonds}, ${newUser.avatar},
          ${newUser.game_id}, ${newUser.rank}, ${newUser.clans}::jsonb,
          ${newUser.usd_balance}, ${newUser.tickets}::jsonb
        )
        RETURNING *
      `;

      return transformUser(rows[0]);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  update: async (id, updateData) => {
    try {
      // Validate clan membership: a user can only be in ONE clan
      if (updateData.clans !== undefined) {
        if (Array.isArray(updateData.clans) && updateData.clans.length > 1) {
          throw new Error("A user can only be part of one clan at a time");
        }
      }

      // Build dynamic update query
      const updates = [];
      const values = [];

      if (updateData.username !== undefined) {
        updates.push(`username = $${updates.length + 1}`);
        values.push(updateData.username);
      }
      if (updateData.email !== undefined) {
        updates.push(`email = $${updates.length + 1}`);
        values.push(updateData.email);
      }
      if (updateData.type !== undefined) {
        updates.push(`type = $${updates.length + 1}`);
        values.push(updateData.type);
      }
      if (updateData.diamonds !== undefined) {
        updates.push(`diamonds = $${updates.length + 1}`);
        values.push(updateData.diamonds);
      }
      if (updateData.avatar !== undefined) {
        updates.push(`avatar = $${updates.length + 1}`);
        values.push(updateData.avatar);
      }
      if (updateData.gameId !== undefined) {
        updates.push(`game_id = $${updates.length + 1}`);
        values.push(updateData.gameId);
      }
      if (updateData.rank !== undefined) {
        updates.push(`rank = $${updates.length + 1}`);
        values.push(updateData.rank);
      }
      if (updateData.clans !== undefined) {
        updates.push(`clans = $${updates.length + 1}::jsonb`);
        values.push(JSON.stringify(updateData.clans));
      }
      if (updateData.usd_balance !== undefined) {
        updates.push(`usd_balance = $${updates.length + 1}`);
        values.push(updateData.usd_balance);
      }
      if (updateData.tickets !== undefined) {
        updates.push(`tickets = $${updates.length + 1}::jsonb`);
        values.push(JSON.stringify(updateData.tickets));
      }

      if (updates.length === 0) {
        return await usersDb.getById(id);
      }

      const query = `
        UPDATE users 
        SET ${updates.join(", ")}, updated_at = NOW()
        WHERE id = $${updates.length + 1}
        RETURNING *
      `;

      const { rows } = await sql.query(query, [...values, id]);
      
      if (!rows || rows.length === 0) {
        console.error(`User update query returned no rows for user id: ${id}`);
        throw new Error(`Failed to update user: user not found or update failed`);
      }
      
      const updatedUser = transformUser(rows[0]);
      console.log(`User update successful for id: ${id}, updated fields:`, Object.keys(updateData));
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  updateDiamonds: async (id, amount) => {
    try {
      const user = await usersDb.getById(id);
      if (!user) return null;

      const newBalance = user.diamonds + amount;
      return await usersDb.update(id, { diamonds: newBalance });
    } catch (error) {
      console.error("Error updating diamonds:", error);
      throw error;
    }
  },
};

// Tournaments operations
export const tournamentsDb = {
  getAll: async () => {
    try {
      const { rows } = await sql`SELECT *, CASE
    WHEN status = 'cancelled' THEN 'cancelled'
    WHEN expires_at > NOW() THEN 'upcoming'
    WHEN expires_at + INTERVAL '1 hour' > NOW() THEN 'ongoing'
    ELSE 'completed'
  END AS status FROM tournaments ORDER BY created_at DESC`;
      return rows;
    } catch (error) {
      console.error("Error getting all tournaments:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const { rows } = await sql`SELECT * FROM tournaments WHERE id = ${id}`;
      return rows[0] || null;
    } catch (error) {
      console.error("Error getting tournament by ID:", error);
      throw error;
    }
  },

  getByHostId: async (hostId) => {
    try {
      const { rows } =
        await sql`SELECT * FROM tournaments WHERE host_id = ${hostId} ORDER BY created_at DESC`;
      return rows;
    } catch (error) {
      console.error("Error getting tournaments by host ID:", error);
      throw error;
    }
  },

  create: async (tournamentData) => {
    try {
      let derivedExpiresAt = tournamentData.expires_at || null;
      if (!derivedExpiresAt && tournamentData.date && tournamentData.time) {
        try {
          const combinedDate = new Date(
            `${tournamentData.date}T${tournamentData.time}`,
          );
          if (!isNaN(combinedDate.getTime())) {
            derivedExpiresAt = combinedDate.toISOString();
          }
        } catch (err) {
          console.warn("Invalid date/time for expires_at:", err);
        }
      }

      const newTournament = {
        id: generateId("tournament"),
        title: tournamentData.title,
        game: tournamentData.game,
        tournament_type: tournamentData.tournament_type || "regular",
        clan_battle_mode: tournamentData.clan_battle_mode || null,
        clan_prize_mode: tournamentData.clan_prize_mode || null,
        clan1_id: tournamentData.clan1_id || null,
        clan2_id: tournamentData.clan2_id || null,
        date: tournamentData.date,
        time: tournamentData.time,
        max_players: tournamentData.max_players,
        max_players_per_clan: tournamentData.max_players_per_clan || null,
        min_rank: tournamentData.min_rank || null,
        prize_pool_type: tournamentData.prize_pool_type,
        prize_pool: tournamentData.prize_pool,
        prize_pool_usd: tournamentData.prize_pool_usd || 0,
        prize_split_first: tournamentData.prize_split_first,
        prize_split_second: tournamentData.prize_split_second,
        prize_split_third: tournamentData.prize_split_third,
        additional_prize_positions:
          tournamentData.additional_prize_positions || 0,
        entry_fee: tournamentData.entry_fee,
        entry_fee_usd: tournamentData.entry_fee_usd || 0,
        rules: tournamentData.rules || "",
        image: tournamentData.image || "🎮",
        host_id: tournamentData.host_id,
        accepts_tickets: tournamentData.accepts_tickets || false,
        display_type: tournamentData.display_type || "event", // Host-created tournaments are "Events"
        expires_at: derivedExpiresAt,
      };

      const { rows } = await sql`
        INSERT INTO tournaments (
          id, title, game, tournament_type, clan_battle_mode, clan_prize_mode,
          clan1_id, clan2_id, date, time, max_players, max_players_per_clan, min_rank,
          prize_pool_type, prize_pool, prize_pool_usd,
          prize_split_first, prize_split_second, prize_split_third, additional_prize_positions,
          entry_fee, entry_fee_usd, rules, image, host_id, accepts_tickets, display_type, expires_at
        )
        VALUES (
          ${newTournament.id}, ${newTournament.title}, ${newTournament.game},
          ${newTournament.tournament_type}, ${newTournament.clan_battle_mode}, ${newTournament.clan_prize_mode},
          ${newTournament.clan1_id}, ${newTournament.clan2_id},
          ${newTournament.date}, ${newTournament.time}, ${newTournament.max_players},
          ${newTournament.max_players_per_clan}, ${newTournament.min_rank}, ${newTournament.prize_pool_type},
          ${newTournament.prize_pool}, ${newTournament.prize_pool_usd},
          ${newTournament.prize_split_first}, ${newTournament.prize_split_second},
          ${newTournament.prize_split_third}, ${newTournament.additional_prize_positions},
          ${newTournament.entry_fee}, ${newTournament.entry_fee_usd}, ${newTournament.rules},
          ${newTournament.image}, ${newTournament.host_id}, ${newTournament.accepts_tickets},
          ${newTournament.display_type}, ${newTournament.expires_at}
        )
        RETURNING *
      `;

      return rows[0];
    } catch (error) {
      console.error("Error creating tournament:", error);
      throw error;
    }
  },

  update: async (id, updateData) => {
    try {
      const updates = [];
      const values = [];

      // Map all possible update fields
      const fieldMap = {
        title: "title",
        game: "game",
        tournament_type: "tournament_type",
        clan_battle_mode: "clan_battle_mode",
        clan_prize_mode: "clan_prize_mode",
        clan1_id: "clan1_id",
        clan2_id: "clan2_id",
        date: "date",
        time: "time",
        max_players: "max_players",
        min_rank: "min_rank",
        prize_pool_type: "prize_pool_type",
        prize_pool: "prize_pool",
        prize_pool_usd: "prize_pool_usd",
        prize_split_first: "prize_split_first",
        prize_split_second: "prize_split_second",
        prize_split_third: "prize_split_third",
        entry_fee: "entry_fee",
        entry_fee_usd: "entry_fee_usd",
        rules: "rules",
        image: "image",
        status: "status",
        cancelled_by: "cancelled_by",
        participants: "participants",
        winner_first: "winner_first",
        winner_second: "winner_second",
        winner_third: "winner_third",
        winning_team: "winning_team",
        accepts_tickets: "accepts_tickets",
        expires_at: "expires_at",
      };

      for (const [key, dbColumn] of Object.entries(fieldMap)) {
        if (updateData[key] !== undefined) {
          updates.push(`${dbColumn} = $${updates.length + 1}`);
          values.push(updateData[key]);
        }
      }

      if (updates.length === 0) {
        return await tournamentsDb.getById(id);
      }

      const query = `
        UPDATE tournaments 
        SET ${updates.join(", ")}, updated_at = NOW()
        WHERE id = $${updates.length + 1}
        RETURNING *
      `;

      const { rows } = await sql.query(query, [...values, id]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error updating tournament:", error);
      throw error;
    }
  },

  addParticipant: async (id, userId) => {
    try {
      const tournament = await tournamentsDb.getById(id);
      if (!tournament) return null;

      if (tournament.participants.includes(userId)) {
        throw new Error("You are already registered for this tournament");
      }

      if (tournament.participants.length >= tournament.max_players) {
        throw new Error("Tournament is full");
      }

      // For clan selection mode, validate per-clan limits
      if (
        tournament.tournament_type === "clan_battle" &&
        tournament.clan_battle_mode === "clan_selection" &&
        tournament.max_players_per_clan
      ) {
        // Get the user's clan
        const user = await usersDb.getById(userId);
        if (!user) {
          throw new Error("User not found");
        }

        const userClans = user.clans || [];
        if (userClans.length === 0) {
          throw new Error(
            "You must be a member of a clan to join this clan battle",
          );
        }

        const userClanId = userClans[0];

        // Check if user's clan is one of the participating clans
        if (
          userClanId !== tournament.clan1_id &&
          userClanId !== tournament.clan2_id
        ) {
          throw new Error(
            "Your clan is not participating in this tournament. Only members of the selected clans can join.",
          );
        }

        // Count participants from user's clan
        const existingParticipants = tournament.participants || [];
        let clanParticipantCount = 0;

        for (const participantId of existingParticipants) {
          const participant = await usersDb.getById(participantId);
          if (
            participant &&
            participant.clans &&
            participant.clans.length > 0
          ) {
            if (participant.clans[0] === userClanId) {
              clanParticipantCount++;
            }
          }
        }

        if (clanParticipantCount >= tournament.max_players_per_clan) {
          throw new Error(
            `Your clan has reached the maximum participant limit (${tournament.max_players_per_clan} players per clan)`,
          );
        }
      }

      const { rows } = await sql`
        UPDATE tournaments 
        SET participants = array_append(participants, ${userId}),
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      return rows[0];
    } catch (error) {
      console.error("Error adding participant:", error);
      throw error;
    }
  },

  declareWinners: async (id, winners) => {
    try {
      const updateData = {
        winner_first: winners.first,
        winner_second: winners.second,
        winner_third: winners.third,
        status: "completed",
      };

      if (winners.winning_team) {
        updateData.winning_team = winners.winning_team;
      }

      return await tournamentsDb.update(id, updateData);
    } catch (error) {
      console.error("Error declaring winners:", error);
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      return await tournamentsDb.update(id, { status });
    } catch (error) {
      console.error("Error updating tournament status:", error);
      throw error;
    }
  },
};

// Transactions operations
export const transactionsDb = {
  getAll: async () => {
    try {
      const { rows } =
        await sql`SELECT * FROM transactions ORDER BY created_at DESC`;
      return rows;
    } catch (error) {
      console.error("Error getting all transactions:", error);
      throw error;
    }
  },

  getByUserId: async (userId) => {
    try {
      const { rows } =
        await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC`;
      return rows;
    } catch (error) {
      console.error("Error getting transactions by user ID:", error);
      throw error;
    }
  },

  create: async (transactionData) => {
    try {
      const newTransaction = {
        id: generateId("transaction"),
        user_id: transactionData.user_id,
        type: transactionData.type,
        amount: transactionData.amount,
        description: transactionData.description || "",
        tournament_id: transactionData.tournament_id || null,
        payment_id: transactionData.payment_id || null,
        payment_method: transactionData.payment_method || null,
        currency: transactionData.currency || "diamonds",
        ticket_type: transactionData.ticket_type || null,
      };

      const { rows } = await sql`
        INSERT INTO transactions (
          id, user_id, type, amount, description,
          tournament_id, payment_id, payment_method, currency, ticket_type
        )
        VALUES (
          ${newTransaction.id}, ${newTransaction.user_id}, ${newTransaction.type},
          ${newTransaction.amount}, ${newTransaction.description},
          ${newTransaction.tournament_id}, ${newTransaction.payment_id},
          ${newTransaction.payment_method}, ${newTransaction.currency},
          ${newTransaction.ticket_type}
        )
        RETURNING *
      `;

      return rows[0];
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  },
};
