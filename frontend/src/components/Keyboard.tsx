import React from 'react';
import { GuessResult, LetterStatus } from '../types';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  guesses: GuessResult[];
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, guesses }) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];

  // Calculate the status of each key based on previous guesses
  const getKeyStatus = (key: string): LetterStatus => {
    let status: LetterStatus = 'empty';

    guesses.forEach((guess) => {
      guess.result.forEach((result) => {
        if (result.letter === key) {
          // Prioritize: hit > present > miss
          if (result.status === 'hit') {
            status = 'hit';
          } else if (result.status === 'present' && status !== 'hit') {
            status = 'present';
          } else if (result.status === 'miss' && status === 'empty') {
            status = 'miss';
          }
        }
      });
    });

    return status;
  };

  const getKeyColor = (key: string): string => {
    if (key === 'ENTER' || key === 'BACKSPACE') {
      return '#d3d6da';
    }

    const status = getKeyStatus(key);
    switch (status) {
      case 'hit':
        return '#6aaa64';
      case 'present':
        return '#c9b458';
      case 'miss':
        return '#787c7e';
      default:
        return '#d3d6da';
    }
  };

  const getKeyTextColor = (key: string): string => {
    const status = getKeyStatus(key);
    return status !== 'empty' ? '#ffffff' : '#000000';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '30px',
        gap: '8px',
      }}
    >
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex', gap: '6px' }}>
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              style={{
                padding: '10px',
                minWidth: key === 'ENTER' || key === 'BACKSPACE' ? '65px' : '43px',
                height: '58px',
                fontSize: key === 'ENTER' || key === 'BACKSPACE' ? '12px' : '20px',
                fontWeight: 'bold',
                backgroundColor: getKeyColor(key),
                color: getKeyTextColor(key),
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
