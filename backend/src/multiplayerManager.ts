import { v4 as uuidv4 } from 'uuid';
import {
  MultiplayerRoom,
  Player,
  GuessResult,
  GameStateUpdate,
  PlayerProgress,
  FinalResults,
  LetterResult
} from './types';
import { defaultConfig } from './config';

// In-memory storage for multiplayer rooms
const rooms = new Map<string, MultiplayerRoom>();
const roomCodeToId = new Map<string, string>();

/**
 * Generate a unique 6-character room code
 */
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Check if code already exists
  if (roomCodeToId.has(code)) {
    return generateRoomCode(); // Recursive call if collision
  }
  return code;
}

/**
 * Calculate score for a single guess
 * Hit = 2 points, Present = 1 point, Miss = 0 points
 */
export function calculateGuessScore(guessResult: GuessResult): number {
  let score = 0;
  guessResult.result.forEach((letterResult: LetterResult) => {
    if (letterResult.status === 'hit') {
      score += 2;
    } else if (letterResult.status === 'present') {
      score += 1;
    }
  });
  return score;
}

/**
 * Create a new multiplayer room
 */
export function createRoom(playerName: string): { roomId: string; roomCode: string; playerId: string } {
  const roomId = uuidv4();
  const roomCode = generateRoomCode();
  const playerId = uuidv4();

  // Select a random word from the word list
  const answer = defaultConfig.wordList[Math.floor(Math.random() * defaultConfig.wordList.length)];

  const player: Player = {
    playerId,
    playerName,
    guesses: [],
    score: 0,
    status: 'waiting',
    hasGuessedCorrectly: false,
  };

  const room: MultiplayerRoom = {
    roomId,
    roomCode,
    hostPlayerId: playerId,
    players: [player],
    status: 'waiting',
    answer,
    maxRounds: defaultConfig.maxRounds,
    maxPlayers: 2,
    createdAt: new Date(),
  };

  rooms.set(roomId, room);
  roomCodeToId.set(roomCode, roomId);

  return { roomId, roomCode, playerId };
}

/**
 * Join an existing room
 */
export function joinRoom(roomCode: string, playerName: string): { roomId: string; playerId: string } | null {
  const roomId = roomCodeToId.get(roomCode);
  if (!roomId) {
    return null; // Room not found
  }

  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  // Check if room is full
  if (room.players.length >= 2) {
    throw new Error('Room is full');
  }

  // Check if game already started
  if (room.status !== 'waiting') {
    throw new Error('Game already started');
  }

  const playerId = uuidv4();

  const player: Player = {
    playerId,
    playerName,
    guesses: [],
    score: 0,
    status: 'waiting',
    hasGuessedCorrectly: false,
  };

  room.players.push(player);

  // Auto-start game when 2 players join
  if (room.players.length === 2) {
    room.status = 'playing';
    room.startedAt = new Date();
    room.players.forEach(p => p.status = 'playing');
  }

  return { roomId, playerId };
}

/**
 * Get room by ID
 */
export function getRoom(roomId: string): MultiplayerRoom | null {
  return rooms.get(roomId) || null;
}

/**
 * Get room by code
 */
export function getRoomByCode(roomCode: string): MultiplayerRoom | null {
  const roomId = roomCodeToId.get(roomCode);
  if (!roomId) return null;
  return rooms.get(roomId) || null;
}

/**
 * Submit a guess for a player in a multiplayer game
 */
export function submitMultiplayerGuess(
  roomId: string,
  playerId: string,
  guessResult: GuessResult
): { success: boolean; score: number } {
  const room = rooms.get(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  const player = room.players.find(p => p.playerId === playerId);
  if (!player) {
    throw new Error('Player not found');
  }

  if (player.status === 'won' || player.status === 'finished') {
    throw new Error('Player has already finished');
  }

  // Add guess to player's history
  player.guesses.push(guessResult);

  // Calculate score for this guess
  const guessScore = calculateGuessScore(guessResult);
  player.score += guessScore;

  // Check if player guessed correctly
  const guessedCorrectly = guessResult.guess.toUpperCase() === room.answer.toUpperCase();
  if (guessedCorrectly) {
    player.hasGuessedCorrectly = true;
    player.status = 'won';
    player.completedAt = new Date();
    player.roundsUsed = player.guesses.length;
  } else if (player.guesses.length >= room.maxRounds) {
    // Player ran out of rounds
    player.status = 'finished';
    player.completedAt = new Date();
    player.roundsUsed = player.guesses.length;
  }

  // Check if game is over (all players finished)
  const allPlayersFinished = room.players.every(
    p => p.status === 'won' || p.status === 'finished'
  );

  if (allPlayersFinished) {
    room.status = 'finished';
    room.finishedAt = new Date();
  }

  return { success: true, score: guessScore };
}

/**
 * Determine the winner(s) of the game
 */
export function determineWinner(room: MultiplayerRoom): FinalResults {
  const players = room.players.map(p => ({
    playerId: p.playerId,
    playerName: p.playerName,
    score: p.score,
    guessedCorrectly: p.hasGuessedCorrectly,
    roundsUsed: p.roundsUsed || p.guesses.length,
  }));

  // Filter players who guessed correctly
  const correctGuessers = players.filter(p => p.guessedCorrectly);

  let winner: string | undefined;
  let winnerName: string | undefined;
  let isTie = false;

  if (correctGuessers.length === 1) {
    // One player guessed correctly - they win
    winner = correctGuessers[0].playerId;
    winnerName = correctGuessers[0].playerName;
  } else if (correctGuessers.length === 2) {
    // Both guessed correctly - check who did it in fewer rounds
    if (correctGuessers[0].roundsUsed < correctGuessers[1].roundsUsed) {
      winner = correctGuessers[0].playerId;
      winnerName = correctGuessers[0].playerName;
    } else if (correctGuessers[1].roundsUsed < correctGuessers[0].roundsUsed) {
      winner = correctGuessers[1].playerId;
      winnerName = correctGuessers[1].playerName;
    } else {
      // Same number of rounds - check score
      if (correctGuessers[0].score > correctGuessers[1].score) {
        winner = correctGuessers[0].playerId;
        winnerName = correctGuessers[0].playerName;
      } else if (correctGuessers[1].score > correctGuessers[0].score) {
        winner = correctGuessers[1].playerId;
        winnerName = correctGuessers[1].playerName;
      } else {
        // Same score - it's a tie
        isTie = true;
      }
    }
  } else {
    // No one guessed correctly - highest score wins
    const sortedByScore = [...players].sort((a, b) => b.score - a.score);
    if (sortedByScore[0].score > sortedByScore[1].score) {
      winner = sortedByScore[0].playerId;
      winnerName = sortedByScore[0].playerName;
    } else {
      // Same score - it's a tie
      isTie = true;
    }
  }

  return {
    winner,
    winnerName,
    isTie,
    players,
    answer: room.answer,
  };
}

/**
 * Get current game state for a room
 */
export function getGameState(roomId: string): GameStateUpdate | null {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  const players: PlayerProgress[] = room.players.map(p => ({
    playerId: p.playerId,
    playerName: p.playerName,
    guesses: p.guesses,
    score: p.score,
    hasWon: p.hasGuessedCorrectly,
    status: p.status,
    roundsUsed: p.guesses.length,
  }));

  // Calculate the current maximum round any player is on
  const currentMaxRound = Math.max(...room.players.map(p => p.guesses.length), 0);

  let finalResults: FinalResults | undefined;
  if (room.status === 'finished') {
    finalResults = determineWinner(room);
  }

  return {
    roomId: room.roomId,
    roomCode: room.roomCode,
    players,
    currentMaxRound,
    maxRounds: room.maxRounds,
    status: room.status,
    winner: finalResults?.winner,
    finalResults,
  };
}

/**
 * Remove a player from a room
 */
export function leaveRoom(roomId: string, playerId: string): boolean {
  const room = rooms.get(roomId);
  if (!room) {
    return false;
  }

  // Remove player
  room.players = room.players.filter(p => p.playerId !== playerId);

  // If room is empty or game was in waiting state, delete the room
  if (room.players.length === 0 || room.status === 'waiting') {
    rooms.delete(roomId);
    roomCodeToId.delete(room.roomCode);
  }

  return true;
}

/**
 * Clean up old rooms (call this periodically)
 */
export function cleanupOldRooms(maxAgeMinutes: number = 30): number {
  const now = new Date();
  let cleaned = 0;

  rooms.forEach((room, roomId) => {
    const ageMinutes = (now.getTime() - room.createdAt.getTime()) / (1000 * 60);
    if (ageMinutes > maxAgeMinutes) {
      rooms.delete(roomId);
      roomCodeToId.delete(room.roomCode);
      cleaned++;
    }
  });

  return cleaned;
}

// Auto-cleanup every 10 minutes
setInterval(() => {
  const cleaned = cleanupOldRooms(30);
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} old rooms`);
  }
}, 10 * 60 * 1000);
