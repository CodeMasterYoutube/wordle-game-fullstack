import { LetterResult, GuessResult, LetterStatus } from './types';

/**
 * Evaluates a guess against the answer following Wordle rules
 * @param guess - The guessed word (5 letters)
 * @param answer - The correct answer (5 letters)
 * @returns Array of LetterResult indicating hit/present/miss for each letter
 */
export function evaluateGuess(guess: string, answer: string): GuessResult {
  const guessUpper = guess.toUpperCase();
  const answerUpper = answer.toUpperCase();

  const result: LetterResult[] = Array(5).fill(null).map(() => ({
    letter: '',
    status: 'miss' as LetterStatus
  }));

  // Create a frequency map of letters in the answer
  const answerLetterCount = new Map<string, number>();
  for (const letter of answerUpper) {
    answerLetterCount.set(letter, (answerLetterCount.get(letter) || 0) + 1);
  }

  // First pass: Mark all exact matches (hits)
  for (let i = 0; i < 5; i++) {
    if (guessUpper[i] === answerUpper[i]) {
      result[i] = {
        letter: guessUpper[i],
        status: 'hit'
      };
      // Decrease the count for this letter
      const count = answerLetterCount.get(guessUpper[i])!;
      answerLetterCount.set(guessUpper[i], count - 1);
    }
  }

  // Second pass: Mark present letters (wrong position)
  for (let i = 0; i < 5; i++) {
    if (result[i].status === 'hit') {
      continue; // Already marked as hit
    }

    const letter = guessUpper[i];
    const remainingCount = answerLetterCount.get(letter) || 0;

    if (remainingCount > 0) {
      result[i] = {
        letter: letter,
        status: 'present'
      };
      answerLetterCount.set(letter, remainingCount - 1);
    } else {
      result[i] = {
        letter: letter,
        status: 'miss'
      };
    }
  }

  return {
    guess: guessUpper,
    result
  };
}

/**
 * Validates if a guess is valid (5 letters, alphabetic)
 */
export function isValidGuess(guess: string): boolean {
  return /^[A-Za-z]{5}$/.test(guess);
}
