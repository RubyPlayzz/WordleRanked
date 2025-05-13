import { db } from "./db";
import { calculateEloRatingChange, calculateRankTier, type GameRecord, type GameStats, type GameWord, type InsertGameRecord, type InsertGameStats, type InsertGameWord, type InsertLeaderboardEntry, type InsertUser, type LeaderboardEntry, type UpdateGameStats, type UpdateUser, type User, DEFAULT_AVATARS } from "@shared/schema";
import { gameRecords, gameStats, gameWords, leaderboardEntries, users } from "@shared/schema";
import { eq, sql, desc, and, isNull } from "drizzle-orm";

// Storage interface for the application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(limit?: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: UpdateUser): Promise<User>;

  // Game words methods
  getAllWords(): Promise<string[]>;
  getDailyWord(): Promise<string>;
  addWord(word: InsertGameWord): Promise<GameWord>;
  markWordAsUsed(word: string, date: Date): Promise<void>;
  isValidWord(word: string): Promise<boolean>;

  // Game stats methods
  getGameStats(userId: number): Promise<GameStats | undefined>;
  createGameStats(stats: InsertGameStats): Promise<GameStats>;
  updateGameStats(userId: number, stats: UpdateGameStats): Promise<GameStats>;

  // Game records methods
  createGameRecord(record: InsertGameRecord): Promise<GameRecord>;
  getGameRecordForToday(userId: number): Promise<GameRecord | undefined>;
  getGameRecordsForUser(userId: number): Promise<GameRecord[]>;

  // Leaderboard methods
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getLeaderboardPosition(userId: number): Promise<number>;
  updateLeaderboardEntry(userId: number, stats: GameStats): Promise<LeaderboardEntry>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getAllUsers(limit: number = 100): Promise<User[]> {
    return await db.select().from(users).limit(limit);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Assign a random default avatar if not specified
    const userWithDefaults = {
      ...insertUser,
      profilePicture: insertUser.profilePicture || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
      displayName: insertUser.displayName || insertUser.username,
    };

    const [user] = await db.insert(users).values(userWithDefaults).returning();
    return user;
  }

  async updateUser(id: number, updateData: UpdateUser): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  // Game words methods
  async getAllWords(): Promise<string[]> {
    const result = await db.select({ word: gameWords.word }).from(gameWords);
    return result.map(row => row.word);
  }

  async getDailyWord(): Promise<string> {
    // Get today's date without time to use as a seed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // First check if we have a word already selected for today
    const [existingWord] = await db
      .select()
      .from(gameWords)
      .where(
        and(
          sql`DATE(${gameWords.dateUsed}) = DATE(${today})`,
          eq(gameWords.isUsed, true)
        )
      );
    
    if (existingWord) {
      return existingWord.word;
    }
    
    // If no word is selected for today, choose one randomly from unused words
    const [randomWord] = await db
      .select()
      .from(gameWords)
      .where(eq(gameWords.isUsed, false))
      .limit(1)
      .orderBy(sql`RANDOM()`);
    
    // If all words have been used, reset some words
    if (!randomWord) {
      // Reset 50 random words that have been used
      await db
        .update(gameWords)
        .set({ isUsed: false, dateUsed: null })
        .where(eq(gameWords.isUsed, true))
        .limit(50);
      
      // Now try again to get a random word
      const [resetWord] = await db
        .select()
        .from(gameWords)
        .where(eq(gameWords.isUsed, false))
        .limit(1)
        .orderBy(sql`RANDOM()`);
      
      if (resetWord) {
        await this.markWordAsUsed(resetWord.word, today);
        return resetWord.word;
      }
    } else {
      await this.markWordAsUsed(randomWord.word, today);
      return randomWord.word;
    }
    
    // Fallback in case something went wrong
    // Create a default word if needed
    const [firstWord] = await db.select().from(gameWords).limit(1);
    
    if (firstWord) {
      await this.markWordAsUsed(firstWord.word, today);
      return firstWord.word;
    }
    
    // If we have no words at all, add one and use it
    const defaultWord = "world";
    const addedWord = await this.addWord({ word: defaultWord });
    await this.markWordAsUsed(addedWord.word, today);
    return addedWord.word;
  }

  async addWord(insertWord: InsertGameWord): Promise<GameWord> {
    const [word] = await db
      .insert(gameWords)
      .values({
        ...insertWord,
        isUsed: false
      })
      .returning();
    
    return word;
  }

  async markWordAsUsed(wordToMark: string, date: Date): Promise<void> {
    await db
      .update(gameWords)
      .set({ isUsed: true, dateUsed: date })
      .where(eq(gameWords.word, wordToMark));
  }

  async isValidWord(word: string): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(gameWords)
      .where(eq(gameWords.word, word.toLowerCase()));
    
    return result.count > 0;
  }

  // Game stats methods
  async getGameStats(userId: number): Promise<GameStats | undefined> {
    const [stats] = await db
      .select()
      .from(gameStats)
      .where(eq(gameStats.userId, userId));
    
    return stats;
  }

  async createGameStats(insertStats: InsertGameStats): Promise<GameStats> {
    const [stats] = await db
      .insert(gameStats)
      .values(insertStats)
      .returning();
    
    // Also create a leaderboard entry for this user
    await this.createLeaderboardEntry({ userId: insertStats.userId });
    
    return stats;
  }

  async updateGameStats(userId: number, updateData: UpdateGameStats): Promise<GameStats> {
    const [stats] = await db
      .update(gameStats)
      .set(updateData)
      .where(eq(gameStats.userId, userId))
      .returning();
    
    // Also update the leaderboard entry
    await this.updateLeaderboardEntry(userId, stats);
    
    return stats;
  }

  // Game records methods
  async createGameRecord(insertRecord: InsertGameRecord): Promise<GameRecord> {
    const [record] = await db
      .insert(gameRecords)
      .values(insertRecord)
      .returning();
    
    return record;
  }

  async getGameRecordForToday(userId: number): Promise<GameRecord | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [record] = await db
      .select()
      .from(gameRecords)
      .where(
        and(
          eq(gameRecords.userId, userId),
          sql`DATE(${gameRecords.date}) = DATE(${today})`
        )
      );
    
    return record;
  }

  async getGameRecordsForUser(userId: number): Promise<GameRecord[]> {
    return await db
      .select()
      .from(gameRecords)
      .where(eq(gameRecords.userId, userId))
      .orderBy(desc(gameRecords.date));
  }

  // Leaderboard methods
  private async createLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    const [result] = await db
      .insert(leaderboardEntries)
      .values(entry)
      .returning();
    
    return result;
  }

  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const leaderboard = await db
      .select({
        id: leaderboardEntries.id,
        userId: leaderboardEntries.userId,
        score: leaderboardEntries.score,
        eloRating: leaderboardEntries.eloRating,
        rank: leaderboardEntries.rank,
        gamesPlayed: leaderboardEntries.gamesPlayed,
        winRate: leaderboardEntries.winRate,
        updatedAt: leaderboardEntries.updatedAt,
        username: users.username,
        displayName: users.displayName,
        profilePicture: users.profilePicture,
      })
      .from(leaderboardEntries)
      .innerJoin(users, eq(leaderboardEntries.userId, users.id))
      .orderBy(desc(leaderboardEntries.eloRating))
      .limit(limit);
    
    return leaderboard;
  }

  async getLeaderboardPosition(userId: number): Promise<number> {
    // Get the user's ELO rating
    const [userEntry] = await db
      .select({ eloRating: leaderboardEntries.eloRating })
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.userId, userId));
    
    if (!userEntry) return 0;
    
    // Count how many players have a higher ELO rating
    const [result] = await db
      .select({ position: sql<number>`count(*) + 1` })
      .from(leaderboardEntries)
      .where(sql`${leaderboardEntries.eloRating} > ${userEntry.eloRating}`);
    
    return result.position;
  }

  async updateLeaderboardEntry(userId: number, stats: GameStats): Promise<LeaderboardEntry> {
    // Calculate rank based on score
    const rank = calculateRankTier(stats.score);
    
    // Calculate win rate
    const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
    
    // Check if entry exists
    const [existingEntry] = await db
      .select()
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.userId, userId));
    
    if (existingEntry) {
      // Update existing entry
      const [updatedEntry] = await db
        .update(leaderboardEntries)
        .set({
          score: stats.score,
          eloRating: stats.eloRating,
          rank,
          gamesPlayed: stats.played,
          winRate,
          updatedAt: new Date()
        })
        .where(eq(leaderboardEntries.userId, userId))
        .returning();
      
      return updatedEntry;
    } else {
      // Create new entry
      return await this.createLeaderboardEntry({
        userId,
        score: stats.score,
        eloRating: stats.eloRating,
        rank,
        gamesPlayed: stats.played,
        winRate
      });
    }
  }
}

export const storage = new DatabaseStorage();
