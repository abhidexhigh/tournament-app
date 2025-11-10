-- Database initialization script for Tournament Platform
-- This script creates all necessary tables with proper indexes and constraints

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('host', 'player', 'game_owner')),
  diamonds INTEGER DEFAULT 0,
  avatar VARCHAR(255) DEFAULT '🎮',
  game_id VARCHAR(255),
  rank VARCHAR(50),
  clans JSONB DEFAULT '[]',
  usd_balance DECIMAL(10, 2) DEFAULT 0,
  tickets JSONB DEFAULT '{"ticket_010": 0, "ticket_100": 0, "ticket_1000": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  game VARCHAR(255) NOT NULL,
  tournament_type VARCHAR(50) DEFAULT 'regular',
  clan_battle_mode VARCHAR(50),
  clan1_id VARCHAR(255),
  clan2_id VARCHAR(255),
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  max_players INTEGER NOT NULL,
  min_rank VARCHAR(50),
  prize_pool_type VARCHAR(50) NOT NULL CHECK (prize_pool_type IN ('fixed', 'entry-based')),
  prize_pool INTEGER NOT NULL,
  prize_pool_usd DECIMAL(10, 2) DEFAULT 0,
  prize_split_first INTEGER NOT NULL,
  prize_split_second INTEGER NOT NULL,
  prize_split_third INTEGER NOT NULL,
  entry_fee INTEGER NOT NULL DEFAULT 0,
  entry_fee_usd DECIMAL(10, 2) DEFAULT 0,
  rules TEXT,
  image VARCHAR(255) DEFAULT '🎮',
  host_id VARCHAR(255) NOT NULL,
  participants TEXT[] DEFAULT '{}',
  winner_first VARCHAR(255),
  winner_second VARCHAR(255),
  winner_third VARCHAR(255),
  winning_team VARCHAR(255),
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  accepts_tickets BOOLEAN DEFAULT false,
  is_automated BOOLEAN DEFAULT false,
  automated_level VARCHAR(50),
  expires_at TIMESTAMP WITH TIME ZONE,
  display_type VARCHAR(50) DEFAULT 'event' CHECK (display_type IN ('tournament', 'event')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  tournament_id VARCHAR(255),
  payment_id VARCHAR(255),
  payment_method VARCHAR(50),
  currency VARCHAR(50) DEFAULT 'diamonds',
  ticket_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);
CREATE INDEX IF NOT EXISTS idx_tournaments_host_id ON tournaments(host_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(date);
CREATE INDEX IF NOT EXISTS idx_tournaments_automated ON tournaments(is_automated, automated_level);
CREATE INDEX IF NOT EXISTS idx_tournaments_expires_at ON tournaments(expires_at);
CREATE INDEX IF NOT EXISTS idx_tournaments_display_type ON tournaments(display_type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tournament_id ON transactions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Create function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

