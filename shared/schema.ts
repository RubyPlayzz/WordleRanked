import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user schema - required for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

export const updateUserSchema = createInsertSchema(users).omit({
  id: true,
  password: true,
  createdAt: true,
}).partial();

// Game statistics schema
export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  played: integer("played").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  maxStreak: integer("max_streak").notNull().default(0),
  score: integer("score").notNull().default(0),
  lastPlayed: timestamp("last_played"),
  distribution: text("distribution").notNull().default("0,0,0,0,0,0"), // Comma-separated counts for 1-6 attempts
  rank: text("rank").notNull().default("Bronze"),
  eloRating: integer("elo_rating").notNull().default(1000),
});

export const insertGameStatsSchema = createInsertSchema(gameStats).pick({
  userId: true,
});

export const updateGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
}).partial();

// Game words schema
export const gameWords = pgTable("game_words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull().unique(),
  dateUsed: timestamp("date_used"),
  isUsed: boolean("is_used").notNull().default(false),
});

export const insertGameWordSchema = createInsertSchema(gameWords).pick({
  word: true,
});

// Game records schema (to track daily games)
export const gameRecords = pgTable("game_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  word: text("word").notNull(),
  attempts: integer("attempts"),
  success: boolean("success").notNull().default(false),
  date: timestamp("date").notNull().defaultNow(),
});

export const insertGameRecordSchema = createInsertSchema(gameRecords).pick({
  userId: true,
  word: true,
  attempts: true,
  success: true,
});

// Leaderboard entry schema
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull().default(0),
  eloRating: integer("elo_rating").notNull().default(1000),
  rank: text("rank").notNull().default("Bronze"),
  gamesPlayed: integer("games_played").notNull().default(0),
  winRate: integer("win_rate").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).pick({
  userId: true,
});

// Profile pictures (default avatars)
export const DEFAULT_AVATARS = [
  "/avatars/avatar1.svg",
  "/avatars/avatar2.svg",
  "/avatars/avatar3.svg",
  "/avatars/avatar4.svg",
  "/avatars/avatar5.svg",
  "/avatars/avatar6.svg",
];

// Rank tiers
export const RANK_TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Champion'] as const;
export const rankTierSchema = z.enum(RANK_TIERS);

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type GameStats = typeof gameStats.$inferSelect;
export type UpdateGameStats = z.infer<typeof updateGameStatsSchema>;

export type InsertGameWord = z.infer<typeof insertGameWordSchema>;
export type GameWord = typeof gameWords.$inferSelect;

export type InsertGameRecord = z.infer<typeof insertGameRecordSchema>;
export type GameRecord = typeof gameRecords.$inferSelect;

export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;

export type RankTier = z.infer<typeof rankTierSchema>;

// Helper function to calculate the rank tier based on score
export function calculateRankTier(score: number): RankTier {
  if (score < 500) return 'Bronze';
  if (score < 1000) return 'Silver';
  if (score < 1500) return 'Gold';
  if (score < 2000) return 'Platinum';
  if (score < 2500) return 'Diamond';
  return 'Champion';
}

// Helper function to calculate ELO rating change
export function calculateEloRatingChange(
  playerRating: number,
  outcome: 'win' | 'loss',
  attempts?: number
): number {
  const K = 32; // K-factor determining maximum possible adjustment per game
  const expectedScore = 1 / (1 + Math.pow(10, (1400 - playerRating) / 400));
  
  let actualScore = 0;
  if (outcome === 'win') {
    actualScore = 1;
    // Bonus for quick wins (fewer attempts)
    if (attempts) {
      // Multiplier that decreases as attempts increase: 1.5 for 1 attempt, down to 1.0 for 6 attempts
      const multiplier = 1.5 - (attempts - 1) * 0.1;
      return Math.round(K * (actualScore - expectedScore) * multiplier);
    }
  }
  
  return Math.round(K * (actualScore - expectedScore));
}
