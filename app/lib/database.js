// Database utilities using Vercel Postgres
// This replaces the JSON file-based storage with a real database

import { sql } from "@vercel/postgres";

// Generate unique ID
export const generateId = (prefix = "") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get current timestamp
export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

// Users operations
export const usersDb = {
  getAll: async () => {
    try {
      const { rows } = await sql`SELECT * FROM users ORDER BY created_at DESC`;
      return rows;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const { rows } = await sql`SELECT * FROM users WHERE id = ${id}`;
      return rows[0] || null;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  },

  getByEmail: async (email) => {
    try {
      const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
      return rows[0] || null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  },

  create: async (userData) => {
    try {
      const newUser = {
        id: generateId("user"),
        username: userData.username,
        email: userData.email,
        type: userData.type,
        diamonds: userData.diamonds || 0,
        avatar: userData.avatar || "🎮",
        game_id: userData.gameId || null,
        rank: userData.rank || null,
        clans: JSON.stringify(userData.clans || []),
        usd_balance: userData.usd_balance || 0,
        tickets: JSON.stringify(
          userData.tickets || {
            ticket_010: 0,
            ticket_100: 0,
            ticket_1000: 0,
          }
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

      return rows[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  update: async (id, updateData) => {
    try {
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
      return rows[0] || null;
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
      const { rows } =
        await sql`SELECT * FROM tournaments ORDER BY created_at DESC`;
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
      const newTournament = {
        id: generateId("tournament"),
        title: tournamentData.title,
        game: tournamentData.game,
        tournament_type: tournamentData.tournament_type || "regular",
        clan_battle_mode: tournamentData.clan_battle_mode || null,
        clan1_id: tournamentData.clan1_id || null,
        clan2_id: tournamentData.clan2_id || null,
        date: tournamentData.date,
        time: tournamentData.time,
        max_players: tournamentData.max_players,
        min_rank: tournamentData.min_rank || null,
        prize_pool_type: tournamentData.prize_pool_type,
        prize_pool: tournamentData.prize_pool,
        prize_pool_usd: tournamentData.prize_pool_usd || 0,
        prize_split_first: tournamentData.prize_split_first,
        prize_split_second: tournamentData.prize_split_second,
        prize_split_third: tournamentData.prize_split_third,
        entry_fee: tournamentData.entry_fee,
        entry_fee_usd: tournamentData.entry_fee_usd || 0,
        rules: tournamentData.rules || "",
        image: tournamentData.image || "🎮",
        host_id: tournamentData.host_id,
        accepts_tickets: tournamentData.accepts_tickets || false,
      };

      const { rows } = await sql`
        INSERT INTO tournaments (
          id, title, game, tournament_type, clan_battle_mode,
          clan1_id, clan2_id, date, time, max_players, min_rank,
          prize_pool_type, prize_pool, prize_pool_usd,
          prize_split_first, prize_split_second, prize_split_third,
          entry_fee, entry_fee_usd, rules, image, host_id, accepts_tickets
        )
        VALUES (
          ${newTournament.id}, ${newTournament.title}, ${newTournament.game},
          ${newTournament.tournament_type}, ${newTournament.clan_battle_mode},
          ${newTournament.clan1_id}, ${newTournament.clan2_id},
          ${newTournament.date}, ${newTournament.time}, ${newTournament.max_players},
          ${newTournament.min_rank}, ${newTournament.prize_pool_type},
          ${newTournament.prize_pool}, ${newTournament.prize_pool_usd},
          ${newTournament.prize_split_first}, ${newTournament.prize_split_second},
          ${newTournament.prize_split_third}, ${newTournament.entry_fee},
          ${newTournament.entry_fee_usd}, ${newTournament.rules},
          ${newTournament.image}, ${newTournament.host_id}, ${newTournament.accepts_tickets}
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
        participants: "participants",
        winner_first: "winner_first",
        winner_second: "winner_second",
        winner_third: "winner_third",
        winning_team: "winning_team",
        accepts_tickets: "accepts_tickets",
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
