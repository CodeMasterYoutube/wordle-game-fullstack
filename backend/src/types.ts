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
