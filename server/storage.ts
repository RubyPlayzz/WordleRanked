import { type GameRecord, type GameStats, type GameWord, type InsertGameRecord, type InsertGameStats, type InsertGameWord, type InsertUser, type UpdateGameStats, type User, calculateRankTier } from "@shared/schema";

// Storage interface for the application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Game words methods
  getAllWords(): Promise<string[]>;
  getDailyWord(): Promise<string>;
  addWord(word: InsertGameWord): Promise<GameWord>;
  markWordAsUsed(word: string, date: Date): Promise<void>;

  // Game stats methods
  getGameStats(userId: number): Promise<GameStats | undefined>;
  createGameStats(stats: InsertGameStats): Promise<GameStats>;
  updateGameStats(userId: number, stats: UpdateGameStats): Promise<GameStats>;

  // Game records methods
  createGameRecord(record: InsertGameRecord): Promise<GameRecord>;
  getGameRecordForToday(userId: number): Promise<GameRecord | undefined>;
  getGameRecordsForUser(userId: number): Promise<GameRecord[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameWords: Map<number, GameWord>;
  private gameStats: Map<number, GameStats>;
  private gameRecords: Map<number, GameRecord>;
  private userIdCounter: number;
  private wordIdCounter: number;
  private gameStatsIdCounter: number;
  private gameRecordIdCounter: number;
  private wordList: string[];

  constructor() {
    this.users = new Map();
    this.gameWords = new Map();
    this.gameStats = new Map();
    this.gameRecords = new Map();
    this.userIdCounter = 1;
    this.wordIdCounter = 1;
    this.gameStatsIdCounter = 1;
    this.gameRecordIdCounter = 1;
    this.wordList = [
      "about", "above", "abuse", "actor", "acute", "admit", "adopt", "adult", "after", "again",
      "apple", "award", "beach", "begin", "black", "blame", "blind", "block", "blood", "board",
      "brain", "bread", "break", "brown", "build", "burst", "cabin", "cable", "carry", "catch",
      "cause", "chair", "cheap", "check", "chest", "chief", "child", "civil", "claim", "class",
      "clean", "clear", "climb", "clock", "close", "cloud", "coast", "comic", "count", "court",
      "cover", "crack", "craft", "crash", "cream", "crime", "cross", "crowd", "crown", "cycle",
      "daily", "dance", "death", "debut", "delay", "depth", "doubt", "draft", "drama", "dream",
      "dress", "drink", "drive", "earth", "eight", "elite", "empty", "enemy", "enjoy", "enter",
      "entry", "equal", "error", "event", "exact", "exist", "extra", "faith", "false", "fault",
      "field", "fight", "final", "first", "fixed", "flash", "fleet", "floor", "focus", "force",
      "frame", "frank", "front", "fruit", "fully", "funny", "ghost", "giant", "glass", "globe",
      "glory", "goals", "grand", "grant", "grass", "great", "green", "group", "guide", "happy",
      "heart", "heavy", "hello", "horse", "hotel", "house", "human", "ideal", "image", "index",
      "inner", "input", "issue", "japan", "joint", "judge", "juice", "knife", "known", "label",
      "large", "laser", "later", "laugh", "layer", "learn", "leave", "legal", "level", "light",
      "limit", "lions", "local", "logic", "loose", "lucky", "lunch", "magic", "major", "maker",
      "march", "match", "maybe", "mayor", "media", "merit", "metal", "might", "minor", "mixed",
      "model", "money", "month", "moral", "motor", "mount", "mouse", "mouth", "movie", "music",
      "night", "noise", "north", "novel", "nurse", "ocean", "offer", "often", "order", "other",
      "outer", "owner", "panel", "paper", "party", "peace", "phase", "phone", "photo", "piece",
      "pilot", "pitch", "place", "plain", "plane", "plant", "plate", "point", "pound", "power",
      "press", "price", "pride", "prime", "print", "prior", "prize", "proof", "proud", "prove",
      "queen", "quick", "quiet", "quite", "radio", "raise", "range", "rapid", "ratio", "reach",
      "ready", "refer", "right", "river", "rough", "round", "route", "royal", "rural", "scale",
      "scene", "scope", "score", "sense", "serve", "shall", "shape", "share", "sharp", "sheep",
      "sheet", "shelf", "shell", "shift", "shirt", "shock", "shoot", "short", "shown", "sight",
      "since", "skill", "sleep", "slide", "small", "smart", "smile", "smith", "smoke", "solid",
      "solve", "sorry", "sound", "south", "space", "spare", "speak", "speed", "spend", "spirit",
      "sport", "squad", "staff", "stage", "stand", "start", "state", "steam", "steel", "stick",
      "still", "stock", "stone", "store", "storm", "story", "strip", "study", "stuff", "style",
      "sugar", "suite", "super", "sweet", "table", "taken", "taste", "taxes", "teach", "teeth",
      "terry", "texas", "thank", "theft", "their", "theme", "there", "thick", "thing", "think",
      "third", "those", "three", "throw", "tight", "times", "tired", "title", "today", "topic",
      "total", "touch", "tough", "tower", "track", "trade", "train", "treat", "trend", "trial",
      "tried", "tries", "truck", "truly", "trust", "truth", "twice", "under", "undue", "union",
      "unity", "until", "upper", "upset", "urban", "usage", "usual", "valid", "value", "video",
      "virus", "visit", "vital", "voice", "waste", "watch", "water", "wheel", "where", "which",
      "while", "white", "whole", "whose", "woman", "world", "worry", "worse", "worst", "worth",
      "would", "wound", "write", "wrong", "years", "yield", "young", "youth"
    ];

    // Initialize some words
    this.wordList.forEach(word => {
      this.addWord({ word }).catch(console.error);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Game words methods
  async getAllWords(): Promise<string[]> {
    return Array.from(this.gameWords.values()).map(word => word.word);
  }

  async getDailyWord(): Promise<string> {
    // Get today's date without time to use as a seed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find a word that was marked for today, or select a new one
    const existingWord = Array.from(this.gameWords.values()).find(
      word => word.dateUsed && word.dateUsed.getTime() === today.getTime()
    );

    if (existingWord) {
      return existingWord.word;
    }
    
    // If no word is selected for today, choose one randomly
    const unusedWords = Array.from(this.gameWords.values()).filter(word => !word.isUsed);
    if (unusedWords.length === 0) {
      // If all words have been used, reset a random subset
      const resetCount = Math.min(this.gameWords.size, 50);
      const allWords = Array.from(this.gameWords.values());
      for (let i = 0; i < resetCount; i++) {
        const randomIndex = Math.floor(Math.random() * allWords.length);
        const wordToReset = allWords[randomIndex];
        wordToReset.isUsed = false;
        wordToReset.dateUsed = undefined;
        this.gameWords.set(wordToReset.id, wordToReset);
        allWords.splice(randomIndex, 1);
      }
    }
    
    // Select a random unused word
    const availableWords = Array.from(this.gameWords.values()).filter(word => !word.isUsed);
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const selectedWord = availableWords[randomIndex];
    
    // Mark it as used for today
    await this.markWordAsUsed(selectedWord.word, today);
    
    return selectedWord.word;
  }

  async addWord(insertWord: InsertGameWord): Promise<GameWord> {
    const id = this.wordIdCounter++;
    const word: GameWord = { 
      ...insertWord, 
      id, 
      isUsed: false,
      dateUsed: undefined 
    };
    this.gameWords.set(id, word);
    return word;
  }

  async markWordAsUsed(wordToMark: string, date: Date): Promise<void> {
    const wordEntry = Array.from(this.gameWords.values()).find(
      entry => entry.word.toLowerCase() === wordToMark.toLowerCase()
    );
    
    if (wordEntry) {
      wordEntry.isUsed = true;
      wordEntry.dateUsed = date;
      this.gameWords.set(wordEntry.id, wordEntry);
    }
  }

  // Game stats methods
  async getGameStats(userId: number): Promise<GameStats | undefined> {
    return Array.from(this.gameStats.values()).find(
      stats => stats.userId === userId
    );
  }

  async createGameStats(insertStats: InsertGameStats): Promise<GameStats> {
    const id = this.gameStatsIdCounter++;
    const stats: GameStats = {
      id,
      userId: insertStats.userId,
      played: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
      score: 0,
      distribution: "0,0,0,0,0,0", // Comma-separated counts for 1-6 attempts
      lastPlayed: undefined
    };
    this.gameStats.set(id, stats);
    return stats;
  }

  async updateGameStats(userId: number, updateStats: UpdateGameStats): Promise<GameStats> {
    const existingStats = await this.getGameStats(userId);
    if (!existingStats) {
      throw new Error(`No stats found for user ID ${userId}`);
    }

    const updatedStats: GameStats = {
      ...existingStats,
      ...updateStats
    };

    this.gameStats.set(existingStats.id, updatedStats);
    return updatedStats;
  }

  // Game records methods
  async createGameRecord(insertRecord: InsertGameRecord): Promise<GameRecord> {
    const id = this.gameRecordIdCounter++;
    const record: GameRecord = {
      ...insertRecord,
      id,
      date: new Date()
    };
    this.gameRecords.set(id, record);
    return record;
  }

  async getGameRecordForToday(userId: number): Promise<GameRecord | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.gameRecords.values()).find(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return record.userId === userId && recordDate.getTime() === today.getTime();
    });
  }

  async getGameRecordsForUser(userId: number): Promise<GameRecord[]> {
    return Array.from(this.gameRecords.values())
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export const storage = new MemStorage();
