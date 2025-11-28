export type LetterStatus = 'hit' | 'present' | 'miss' | 'empty';

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

export interface GuessResult {
  guess: string;
  result: LetterResult[];
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

export interface ConfigResponse {
  maxRounds: number;
  wordListSize: number;
}

// Multiplayer Types
export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type PlayerStatus = 'waiting' | 'playing' | 'won' | 'finished';

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
  currentTurnPlayerId?: string;
  winner?: string;
  finalResults?: FinalResults;
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

export interface MultiplayerGuessResponse {
  success: boolean;
  guessResult: GuessResult;
  score: number;
  totalScore: number;
  gameState: GameStateUpdate;
}
