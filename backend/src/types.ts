export type LetterStatus = 'hit' | 'present' | 'miss' | 'empty';

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

export interface GuessResult {
  guess: string;
  result: LetterResult[];
}

export interface GameConfig {
  maxRounds: number;
  wordList: string[];
}

export interface GameState {
  id: string;
  answer: string;
  guesses: GuessResult[];
  maxRounds: number;
  isWon: boolean;
  isLost: boolean;
  isOver: boolean;
}

export interface GameResponse {
  gameId: string;
  guessResult?: GuessResult;
  guesses: GuessResult[];
  isWon: boolean;
  isLost: boolean;
  isOver: boolean;
  answer?: string;
  remainingRounds: number;
}

// Multiplayer Types
export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type PlayerStatus = 'waiting' | 'playing' | 'won' | 'finished';

export interface Player {
  playerId: string;
  playerName: string;
  guesses: GuessResult[];
  score: number;
  status: PlayerStatus;
  hasGuessedCorrectly: boolean;
  completedAt?: Date;
  roundsUsed?: number;
}

export interface MultiplayerRoom {
  roomId: string;
  roomCode: string;
  hostPlayerId: string;
  players: Player[];
  status: RoomStatus;
  answer: string;
  maxRounds: number;
  maxPlayers: 2;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

export interface PlayerProgress {
  playerId: string;
  playerName: string;
  guesses: GuessResult[];
  score: number;
  hasWon: boolean;
  status: PlayerStatus;
  roundsUsed: number;
}

export interface FinalResults {
  winner?: string;
  winnerName?: string;
  isTie: boolean;
  players: {
    playerId: string;
    playerName: string;
    score: number;
    guessedCorrectly: boolean;
    roundsUsed: number;
  }[];
  answer: string;
}

export interface GameStateUpdate {
  roomId: string;
  roomCode: string;
  players: PlayerProgress[];
  currentMaxRound: number;
  maxRounds: number;
  status: RoomStatus;
  winner?: string;
  finalResults?: FinalResults;
}

export interface CreateRoomRequest {
  playerName: string;
}

export interface JoinRoomRequest {
  playerName: string;
  roomCode: string;
}

export interface CreateRoomResponse {
  roomId: string;
  roomCode: string;
  playerId: string;
  playerName: string;
}

export interface JoinRoomResponse {
  roomId: string;
  roomCode: string;
  playerId: string;
  playerName: string;
  players: PlayerProgress[];
}

export interface MultiplayerGuessRequest {
  playerId: string;
  guess: string;
}

export interface MultiplayerGuessResponse {
  success: boolean;
  guessResult: GuessResult;
  score: number;
  totalScore: number;
  gameState: GameStateUpdate;
}
