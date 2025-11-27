import React from 'react';
import { LetterStatus } from '../types';

interface TileProps {
  letter: string;
  status: LetterStatus;
}

const Tile: React.FC<TileProps> = ({ letter, status }) => {
  const getBackgroundColor = () => {
    switch (status) {
      case 'hit':
        return '#6aaa64'; // Green
      case 'present':
        return '#c9b458'; // Yellow
      case 'miss':
        return '#787c7e'; // Gray
      default:
        return '#ffffff'; // White
    }
  };

  const getBorderColor = () => {
    return status === 'empty' ? '#d3d6da' : getBackgroundColor();
  };

  const getTextColor = () => {
    return status === 'empty' ? '#000000' : '#ffffff';
  };

  return (
    <div
      style={{
        width: '62px',
        height: '62px',
        border: `2px solid ${getBorderColor()}`,
        backgroundColor: getBackgroundColor(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        fontWeight: 'bold',
        color: getTextColor(),
        textTransform: 'uppercase',
        margin: '2px',
      }}
    >
      {letter}
    </div>
  );
};

export default Tile;
