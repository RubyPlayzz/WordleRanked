import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user schema - required for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

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

// Rank tiers
export const RANK_TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'] as const;
export const rankTierSchema = z.enum(RANK_TIERS);

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type GameStats = typeof gameStats.$inferSelect;
export type UpdateGameStats = z.infer<typeof updateGameStatsSchema>;

export type InsertGameWord = z.infer<typeof insertGameWordSchema>;
export type GameWord = typeof gameWords.$inferSelect;

export type InsertGameRecord = z.infer<typeof insertGameRecordSchema>;
export type GameRecord = typeof gameRecords.$inferSelect;

export type RankTier = z.infer<typeof rankTierSchema>;

// Helper function to calculate the rank tier based on score
export function calculateRankTier(score: number): RankTier {
  if (score < 500) return 'Bronze';
  if (score < 1000) return 'Silver';
  if (score < 1500) return 'Gold';
  if (score < 2000) return 'Platinum';
  return 'Diamond';
}
