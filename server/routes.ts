import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { calculateRankTier, insertGameRecordSchema, insertUserSchema, updateUserSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import { DEFAULT_AVATARS } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Get daily word
  app.get("/api/word", async (req, res) => {
    try {
      const word = await storage.getDailyWord();
      res.json({ word });
    } catch (error) {
      res.status(500).json({ message: "Failed to get daily word" });
    }
  });

  // Validate a word (check if it's a valid 5-letter word)
  app.get("/api/validate-word/:word", async (req, res) => {
    try {
      const word = req.params.word.toLowerCase();
      
      // Check if the word is 5 letters
      if (word.length !== 5) {
        return res.json({ valid: false, message: "Word must be 5 letters" });
      }
      
      // Check if the word contains only letters
      if (!/^[a-z]+$/.test(word)) {
        return res.json({ valid: false, message: "Word must contain only letters" });
      }

      // For now we'll allow any 5-letter word composed of letters
      // You could add a dictionary API integration here in the future
      return res.json({ valid: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to validate word" });
    }
  });

  // Register a new user
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create the user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Create initial game stats for the user
      await storage.createGameStats({ userId: user.id });
      
      res.status(201).json({ 
        id: user.id, 
        username: user.username,
        displayName: user.displayName,
        profilePicture: user.profilePicture
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Login a user
  app.post("/api/users/login", async (req, res) => {
    try {
      const { username, password } = z.object({
        username: z.string(),
        password: z.string()
      }).parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare password with hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get user's game stats
      let gameStats = await storage.getGameStats(user.id);
      
      // If user doesn't have game stats, create them
      if (!gameStats) {
        gameStats = await storage.createGameStats({ userId: user.id });
      }

      // Get user's leaderboard position
      const leaderboardPosition = await storage.getLeaderboardPosition(user.id);
      
      res.json({ 
        id: user.id, 
        username: user.username,
        displayName: user.displayName || user.username,
        profilePicture: user.profilePicture,
        stats: {
          ...gameStats,
          rank: gameStats.rank || calculateRankTier(gameStats.score),
          position: leaderboardPosition
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Get user profile
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's stats
      const gameStats = await storage.getGameStats(userId);
      
      // Get user's leaderboard position
      const leaderboardPosition = await storage.getLeaderboardPosition(userId);
      
      res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        stats: gameStats ? {
          ...gameStats,
          rank: gameStats.rank || calculateRankTier(gameStats.score),
          position: leaderboardPosition
        } : null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });

  // Update user profile
  app.patch("/api/users/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updateData = updateUserSchema.parse(req.body);
      
      // If username is being updated, check if it's already taken
      if (updateData.username) {
        const existingUser = await storage.getUserByUsername(updateData.username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ message: "Username already taken" });
        }
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName || updatedUser.username,
        profilePicture: updatedUser.profilePicture
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Get available avatar options
  app.get("/api/avatars", (req, res) => {
    res.json({ avatars: DEFAULT_AVATARS });
  });

  // Get user's game stats
  app.get("/api/stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let gameStats = await storage.getGameStats(userId);
      
      if (!gameStats) {
        gameStats = await storage.createGameStats({ userId });
      }
      
      // Get user's leaderboard position
      const position = await storage.getLeaderboardPosition(userId);
      
      res.json({
        ...gameStats,
        rank: gameStats.rank || calculateRankTier(gameStats.score),
        position
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get game stats" });
    }
  });

  // Check if a user has played today
  app.get("/api/played-today/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const todayRecord = await storage.getGameRecordForToday(userId);
      
      res.json({
        playedToday: !!todayRecord,
        record: todayRecord || null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check play status" });
    }
  });

  // Submit a game result
  app.post("/api/submit-game", async (req, res) => {
    try {
      const gameData = insertGameRecordSchema.parse(req.body);
      const userId = gameData.userId;
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if the user has already played today
      const existingRecord = await storage.getGameRecordForToday(userId);
      if (existingRecord) {
        return res.status(409).json({ 
          message: "Already played today",
          record: existingRecord
        });
      }

      // Create the game record
      const record = await storage.createGameRecord(gameData);
      
      // Update user's stats
      let gameStats = await storage.getGameStats(userId);
      if (!gameStats) {
        gameStats = await storage.createGameStats({ userId });
      }
      
      // Parse the distribution string to an array of numbers
      const distribution = gameStats.distribution.split(',').map(n => parseInt(n));
      
      // Update the game stats
      const updatedStats = {
        played: gameStats.played + 1,
        lastPlayed: record.date,
        distribution: gameStats.distribution,
      };
      
      if (gameData.success) {
        // Only update these if the game was successful
        updatedStats.wins = gameStats.wins + 1;
        updatedStats.currentStreak = gameStats.currentStreak + 1;
        updatedStats.maxStreak = Math.max(gameStats.maxStreak, gameStats.currentStreak + 1);
        
        // Update distribution for successful attempts
        if (gameData.attempts && gameData.attempts >= 1 && gameData.attempts <= 6) {
          distribution[gameData.attempts - 1]++;
          updatedStats.distribution = distribution.join(',');
        }
        
        // Calculate score to add based on attempts (fewer attempts = more points)
        let pointsToAdd = 0;
        if (gameData.attempts) {
          switch (gameData.attempts) {
            case 1: pointsToAdd = 100; break;
            case 2: pointsToAdd = 80; break;
            case 3: pointsToAdd = 60; break;
            case 4: pointsToAdd = 40; break;
            case 5: pointsToAdd = 20; break;
            case 6: pointsToAdd = 10; break;
          }
        }
        
        // Add streak bonus (5 points per streak, max 50 extra points)
        const streakBonus = Math.min(50, gameStats.currentStreak * 5);
        pointsToAdd += streakBonus;
        
        // Calculate ELO rating change
        const eloChange = gameData.attempts
          ? calculateEloRatingChange(gameStats.eloRating || 1000, 'win', gameData.attempts)
          : 0;
        
        updatedStats.score = gameStats.score + pointsToAdd;
        updatedStats.eloRating = (gameStats.eloRating || 1000) + eloChange;
        updatedStats.rank = calculateRankTier(updatedStats.score);
      } else {
        // Reset streak for losses
        updatedStats.currentStreak = 0;
        
        // Calculate ELO rating change for a loss
        const eloChange = calculateEloRatingChange(gameStats.eloRating || 1000, 'loss');
        updatedStats.eloRating = (gameStats.eloRating || 1000) + eloChange;
      }
      
      // Update the game stats
      const finalStats = await storage.updateGameStats(userId, updatedStats);
      
      // Get updated leaderboard position
      const position = await storage.getLeaderboardPosition(userId);
      
      res.status(201).json({
        record,
        stats: {
          ...finalStats,
          position
        },
        pointsEarned: gameData.success ? (finalStats.score - gameStats.score) : 0,
        eloChange: (finalStats.eloRating || 1000) - (gameStats.eloRating || 1000)
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid game data", errors: error.errors });
      }
      console.error("Error submitting game:", error);
      res.status(500).json({ message: "Failed to submit game result" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const leaderboard = await storage.getLeaderboard(limit);
      
      res.json({ leaderboard });
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  return httpServer;
}
