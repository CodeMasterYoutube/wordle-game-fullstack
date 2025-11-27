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
