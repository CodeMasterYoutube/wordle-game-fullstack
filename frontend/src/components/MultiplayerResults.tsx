import React from 'react';
import { GameStateUpdate } from '../types';

interface MultiplayerResultsProps {
  gameState: GameStateUpdate;
  playerId: string;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

const MultiplayerResults: React.FC<MultiplayerResultsProps> = ({
  gameState,
  playerId,
  onPlayAgain,
  onMainMenu,
}) => {
  const { finalResults } = gameState;

  if (!finalResults) {
    return null;
  }

  const isPlayerWinner = finalResults.winner === playerId;
  const isTie = finalResults.isTie;

  const getResultMessage = () => {
    if (isTie) {
      return "It's a Tie!";
    } else if (isPlayerWinner) {
      return 'You Won!';
    } else {
      return 'You Lost';
    }
  };

  const getResultColor = () => {
    if (isTie) return '#c9b458';
    return isPlayerWinner ? '#6aaa64' : '#787c7e';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: getResultColor(),
            marginBottom: '20px',
          }}
        >
          {getResultMessage()}
        </h1>

        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#f8f8f8',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: '16px', color: '#787c7e', marginBottom: '10px' }}>
            The word was:
          </p>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#6aaa64',
              letterSpacing: '4px',
            }}
          >
            {finalResults.answer}
          </div>
        </div>

        <div
          style={{
            marginBottom: '30px',
            padding: '25px',
            backgroundColor: '#f8f8f8',
            borderRadius: '8px',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}
          >
            Final Scores
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {finalResults.players
              .sort((a, b) => {
                if (a.guessedCorrectly && !b.guessedCorrectly) return -1;
                if (!a.guessedCorrectly && b.guessedCorrectly) return 1;
                if (a.guessedCorrectly && b.guessedCorrectly) {
                  if (a.roundsUsed !== b.roundsUsed) return a.roundsUsed - b.roundsUsed;
                }
                return b.score - a.score;
              })
              .map((player, index) => {
                const isThisPlayer = player.playerId === playerId;
                const isWinner = player.playerId === finalResults.winner;

                return (
                  <div
                    key={player.playerId}
                    style={{
                      padding: '20px',
                      backgroundColor: isWinner ? '#6aaa64' : '#ffffff',
                      color: isWinner ? '#ffffff' : '#000000',
                      borderRadius: '8px',
                      border: isWinner ? 'none' : '2px solid #d3d6da',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {index + 1}. {player.playerName}
                          {isThisPlayer && ' (You)'}
                          {isWinner && !isTie && ' 👑'}
                        </div>
                        <div
                          style={{
                            fontSize: '14px',
                            marginTop: '5px',
                            opacity: 0.8,
                          }}
                        >
                          {player.guessedCorrectly
                            ? `Guessed in ${player.roundsUsed} ${
                                player.roundsUsed === 1 ? 'round' : 'rounds'
                              }`
                            : 'Did not guess correctly'}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                        }}
                      >
                        {player.score} pts
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#1976d2',
          }}
        >
          <strong>Scoring:</strong> Hit (green) = 2 points, Present (yellow) = 1 point
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={onPlayAgain}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: '#6aaa64',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Play Again
          </button>

          <button
            onClick={onMainMenu}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: 'transparent',
              color: '#787c7e',
              border: '2px solid #787c7e',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerResults;
