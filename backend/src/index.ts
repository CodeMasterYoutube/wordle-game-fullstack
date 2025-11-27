import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { GameState, GameResponse, GameConfig } from './types';
import { evaluateGuess, isValidGuess } from './gameLogic';
import { defaultConfig } from './config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory storage for game states
const games = new Map<string, GameState>();

// Current game configuration
let gameConfig: GameConfig = { ...defaultConfig };

/**
 * GET /api/config
 * Returns the current game configuration
 */
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    maxRounds: gameConfig.maxRounds,
    wordListSize: gameConfig.wordList.length
  });
});

/**
 * POST /api/config
 * Updates the game configuration
 */
app.post('/api/config', (req: Request, res: Response) => {
  const { maxRounds, wordList } = req.body;

  if (maxRounds !== undefined) {
    if (typeof maxRounds !== 'number' || maxRounds < 1) {
      return res.status(400).json({ error: 'maxRounds must be a positive number' });
    }
    gameConfig.maxRounds = maxRounds;
  }

  if (wordList !== undefined) {
    if (!Array.isArray(wordList) || wordList.length === 0) {
      return res.status(400).json({ error: 'wordList must be a non-empty array' });
    }
    // Validate all words are 5 letters
    for (const word of wordList) {
      if (!/^[A-Za-z]{5}$/.test(word)) {
        return res.status(400).json({
          error: 'All words must be exactly 5 letters and contain only alphabetic characters'
        });
      }
    }
    gameConfig.wordList = wordList.map(w => w.toUpperCase());
  }

  res.json({
    maxRounds: gameConfig.maxRounds,
    wordListSize: gameConfig.wordList.length
  });
});

/**
 * POST /api/game/new
 * Starts a new game
 */
app.post('/api/game/new', (req: Request, res: Response) => {
  const gameId = uuidv4();

  // Select a random word from the word list
  const answer = gameConfig.wordList[Math.floor(Math.random() * gameConfig.wordList.length)];

  const gameState: GameState = {
    id: gameId,
    answer,
    guesses: [],
    maxRounds: gameConfig.maxRounds,
    isWon: false,
    isLost: false,
    isOver: false
  };

  games.set(gameId, gameState);

  const response: GameResponse = {
    gameId,
    guesses: [],
    isWon: false,
    isLost: false,
    isOver: false,
    remainingRounds: gameConfig.maxRounds
  };

  res.json(response);
});

/**
 * POST /api/game/:gameId/guess
 * Submits a guess for the game
 */
app.post('/api/game/:gameId/guess', (req: Request, res: Response) => {
  const { gameId } = req.params;
  const { guess } = req.body;

  // Validate game exists
  const gameState = games.get(gameId);
  if (!gameState) {
    return res.status(404).json({ error: 'Game not found' });
  }

  // Check if game is already over
  if (gameState.isOver) {
    return res.status(400).json({
      error: 'Game is already over',
      answer: gameState.answer
    });
  }

  // Validate guess
  if (!guess || typeof guess !== 'string') {
    return res.status(400).json({ error: 'Guess is required' });
  }

  if (!isValidGuess(guess)) {
    return res.status(400).json({
      error: 'Guess must be exactly 5 letters and contain only alphabetic characters'
    });
  }

  // Evaluate the guess
  const guessResult = evaluateGuess(guess, gameState.answer);
  gameState.guesses.push(guessResult);

  // Check win condition
  if (guess.toUpperCase() === gameState.answer.toUpperCase()) {
    gameState.isWon = true;
    gameState.isOver = true;
  }
  // Check lose condition
  else if (gameState.guesses.length >= gameState.maxRounds) {
    gameState.isLost = true;
    gameState.isOver = true;
  }

  const response: GameResponse = {
    gameId,
    guessResult,
    guesses: gameState.guesses,
    isWon: gameState.isWon,
    isLost: gameState.isLost,
    isOver: gameState.isOver,
    remainingRounds: gameState.maxRounds - gameState.guesses.length
  };

  // Include answer if game is over
  if (gameState.isOver) {
    response.answer = gameState.answer;
  }

  res.json(response);
});

/**
 * GET /api/game/:gameId
 * Gets the current state of a game
 */
app.get('/api/game/:gameId', (req: Request, res: Response) => {
  const { gameId } = req.params;

  const gameState = games.get(gameId);
  if (!gameState) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const response: GameResponse = {
    gameId,
    guesses: gameState.guesses,
    isWon: gameState.isWon,
    isLost: gameState.isLost,
    isOver: gameState.isOver,
    remainingRounds: gameState.maxRounds - gameState.guesses.length
  };

  if (gameState.isOver) {
    response.answer = gameState.answer;
  }

  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Wordle backend server running on port ${PORT}`);
  console.log(`Configuration: Max Rounds = ${gameConfig.maxRounds}, Word List Size = ${gameConfig.wordList.length}`);
});
