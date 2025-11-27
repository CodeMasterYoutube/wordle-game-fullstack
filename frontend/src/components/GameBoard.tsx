import React from 'react';
import Tile from './Tile';
import { GuessResult, LetterStatus } from '../types';

interface GameBoardProps {
  guesses: GuessResult[];
  currentGuess: string;
  maxRounds: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ guesses, currentGuess, maxRounds }) => {
  const rows: Array<{ letters: string[]; statuses: LetterStatus[] }> = [];

  // Add completed guesses
  guesses.forEach((guess) => {
    rows.push({
      letters: guess.result.map((r) => r.letter),
      statuses: guess.result.map((r) => r.status),
    });
  });

  // Add current guess row if game is not over
  if (rows.length < maxRounds) {
    const currentLetters = currentGuess.toUpperCase().split('');
    const currentStatuses: LetterStatus[] = Array(5).fill('empty');

    rows.push({
      letters: [...currentLetters, ...Array(5 - currentLetters.length).fill('')],
      statuses: currentStatuses,
    });
  }

  // Add empty rows
  while (rows.length < maxRounds) {
    rows.push({
      letters: ['', '', '', '', ''],
      statuses: ['empty', 'empty', 'empty', 'empty', 'empty'],
    });
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '20px',
      }}
    >
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.letters.map((letter, colIndex) => (
            <Tile
              key={`${rowIndex}-${colIndex}`}
              letter={letter}
              status={row.statuses[colIndex]}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
