import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { calculateRankTier, insertGameRecordSchema, insertUserSchema } from "@shared/schema";

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

  // Register a new user
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const user = await storage.createUser(userData);
      
      // Create initial game stats for the user
      await storage.createGameStats({ userId: user.id });
      
      res.status(201).json({ id: user.id, username: user.username });
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
      const { username, password } = insertUserSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get user's game stats
      let gameStats = await storage.getGameStats(user.id);
      
      // If user doesn't have game stats, create them
      if (!gameStats) {
        gameStats = await storage.createGameStats({ userId: user.id });
      }

      const rank = calculateRankTier(gameStats.score);
      
      res.json({ 
        id: user.id, 
        username: user.username,
        stats: {
          ...gameStats,
          rank
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to login" });
    }
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
      
      const rank = calculateRankTier(gameStats.score);
      
      res.json({
        ...gameStats,
        rank
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
        
        updatedStats.score = gameStats.score + pointsToAdd;
      } else {
        // Reset streak for losses
        updatedStats.currentStreak = 0;
      }
      
      // Update the game stats
      const finalStats = await storage.updateGameStats(userId, updatedStats);
      
      // Calculate rank
      const rank = calculateRankTier(finalStats.score);
      
      res.status(201).json({
        record,
        stats: {
          ...finalStats,
          rank
        },
        pointsEarned: gameData.success ? (finalStats.score - gameStats.score) : 0
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid game data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit game result" });
    }
  });

  return httpServer;
}
