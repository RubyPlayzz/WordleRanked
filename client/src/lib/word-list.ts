// Simplified validation for 5-letter words
import { apiRequest } from './queryClient';

// Function to check if a word is valid for guessing
export async function validateWord(word: string): Promise<{ valid: boolean, message?: string }> {
  try {
    // First, basic client-side validation
    if (word.length !== 5) {
      return { valid: false, message: "Word must be 5 letters" };
    }
    
    if (!/^[a-zA-Z]+$/.test(word)) {
      return { valid: false, message: "Word must contain only letters" };
    }
    
    // Send to server for validation
    const response = await fetch(`/api/validate-word/${word.toLowerCase()}`);
    if (!response.ok) {
      throw new Error('Failed to validate word');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error validating word:', error);
    return { valid: true }; // If the server is down, allow the word to be valid
  }
}

// Synchronous check for client-side validation only (used for immediate feedback)
export function isValidWord(word: string): boolean {
  // Basic client-side checks only
  return word.length === 5 && /^[a-zA-Z]+$/.test(word);
}
