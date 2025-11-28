import { Router, Request, Response } from 'express';
import {
  createRoom,
  joinRoom,
  getRoom,
  getRoomByCode,
  submitMultiplayerGuess,
  getGameState,
  leaveRoom,
} from './multiplayerManager';
import { evaluateGuess, isValidGuess } from './gameLogic';
import {
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  MultiplayerGuessRequest,
  MultiplayerGuessResponse,
} from './types';

const router = Router();

/**
 * POST /api/multiplayer/room/create
 * Create a new multiplayer room
 */
router.post('/room/create', (req: Request, res: Response) => {
  const { playerName } = req.body as CreateRoomRequest;

  if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
    return res.status(400).json({ error: 'Player name is required' });
  }

  if (playerName.length > 20) {
    return res.status(400).json({ error: 'Player name must be 20 characters or less' });
  }

  try {
    const { roomId, roomCode, playerId } = createRoom(playerName.trim());

    const response: CreateRoomResponse = {
      roomId,
      roomCode,
      playerId,
      playerName: playerName.trim(),
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create room' });
  }
});

/**
 * POST /api/multiplayer/room/join
 * Join an existing room
 */
router.post('/room/join', (req: Request, res: Response) => {
  const { playerName, roomCode } = req.body as JoinRoomRequest;

  if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
    return res.status(400).json({ error: 'Player name is required' });
  }

  if (!roomCode || typeof roomCode !== 'string' || roomCode.trim().length === 0) {
    return res.status(400).json({ error: 'Room code is required' });
  }

  if (playerName.length > 20) {
    return res.status(400).json({ error: 'Player name must be 20 characters or less' });
  }

  try {
    const result = joinRoom(roomCode.trim().toUpperCase(), playerName.trim());

    if (!result) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const { roomId, playerId } = result;
    const room = getRoom(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const response: JoinRoomResponse = {
      roomId,
      roomCode: room.roomCode,
      playerId,
      playerName: playerName.trim(),
      players: room.players.map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        guesses: p.guesses,
        score: p.score,
        hasWon: p.hasGuessedCorrectly,
        status: p.status,
        roundsUsed: p.guesses.length,
      })),
    };

    res.json(response);
  } catch (error: any) {
    if (error.message === 'Room is full') {
      return res.status(400).json({ error: 'Room is full (maximum 2 players)' });
    }
    if (error.message === 'Game already started') {
      return res.status(400).json({ error: 'Game has already started' });
    }
    res.status(500).json({ error: error.message || 'Failed to join room' });
  }
});

/**
 * GET /api/multiplayer/room/:roomId
 * Get room information
 */
router.get('/room/:roomId', (req: Request, res: Response) => {
  const { roomId } = req.params;

  const room = getRoom(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    roomId: room.roomId,
    roomCode: room.roomCode,
    status: room.status,
    players: room.players.map(p => ({
      playerId: p.playerId,
      playerName: p.playerName,
      status: p.status,
    })),
    maxRounds: room.maxRounds,
  });
});

/**
 * POST /api/multiplayer/game/:roomId/guess
 * Submit a guess in a multiplayer game
 */
router.post('/game/:roomId/guess', (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { playerId, guess } = req.body as MultiplayerGuessRequest;

  // Validate room
  const room = getRoom(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Validate game status
  if (room.status !== 'playing') {
    return res.status(400).json({ error: 'Game is not in progress' });
  }

  // Validate player
  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  const player = room.players.find(p => p.playerId === playerId);
  if (!player) {
    return res.status(404).json({ error: 'Player not found in this room' });
  }

  // Validate guess
  if (!guess || typeof guess !== 'string') {
    return res.status(400).json({ error: 'Guess is required' });
  }

  if (!isValidGuess(guess)) {
    return res.status(400).json({
      error: 'Guess must be exactly 5 letters and contain only alphabetic characters',
    });
  }

  try {
    // Evaluate the guess
    const guessResult = evaluateGuess(guess, room.answer);

    // Submit the guess and update player state
    const { success, score } = submitMultiplayerGuess(roomId, playerId, guessResult);

    // Get updated game state
    const gameState = getGameState(roomId);

    if (!gameState) {
      return res.status(500).json({ error: 'Failed to get game state' });
    }

    const response: MultiplayerGuessResponse = {
      success,
      guessResult,
      score,
      totalScore: player.score,
      gameState,
    };

    res.json(response);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to submit guess' });
  }
});

/**
 * GET /api/multiplayer/game/:roomId/state
 * Get current game state (for polling)
 */
router.get('/game/:roomId/state', (req: Request, res: Response) => {
  const { roomId } = req.params;

  const gameState = getGameState(roomId);
  if (!gameState) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json(gameState);
});

/**
 * DELETE /api/multiplayer/room/:roomId/leave
 * Leave a room
 */
router.delete('/room/:roomId/leave', (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { playerId } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  const success = leaveRoom(roomId, playerId);

  if (!success) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({ success: true });
});

export default router;
