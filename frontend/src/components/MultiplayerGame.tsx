import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './GameBoard';
import Keyboard from './Keyboard';
import { submitMultiplayerGuess, getGameState } from '../api';
import { GameStateUpdate, PlayerProgress } from '../types';

interface MultiplayerGameProps {
  roomId: string;
  roomCode: string;
  playerId: string;
  playerName: string;
  onGameFinished: (gameState: GameStateUpdate) => void;
}

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  roomId,
  roomCode,
  playerId,
  playerName,
  onGameFinished,
}) => {
  const [gameState, setGameState] = useState<GameStateUpdate | null>(null);
  const [currentGuess, setCurrentGuess] = useState('');
  const [message, setMessage] = useState('Start guessing!');
  const [isLoading, setIsLoading] = useState(false);

  const currentPlayer = gameState?.players.find(p => p.playerId === playerId);
  const opponent = gameState?.players.find(p => p.playerId !== playerId);
  const isGameOver = gameState?.status === 'finished';
  const hasPlayerFinished = currentPlayer?.status === 'won' || currentPlayer?.status === 'finished';

  // Poll for game state updates every 1.5 seconds
  const pollGameState = useCallback(async () => {
    try {
      const state = await getGameState(roomId);
      setGameState(state);

      if (state.status === 'finished') {
        onGameFinished(state);
      }
    } catch (error) {
      console.error('Error polling game state:', error);
    }
  }, [roomId, onGameFinished]);

  useEffect(() => {
    pollGameState();
    const interval = setInterval(pollGameState, 1500);
    return () => clearInterval(interval);
  }, [pollGameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || hasPlayerFinished) return;

      if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, isGameOver, hasPlayerFinished]);

  const handleKeyPress = async (key: string) => {
    if (isGameOver || hasPlayerFinished) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setMessage('Word must be 5 letters');
        return;
      }

      try {
        setIsLoading(true);
        const response = await submitMultiplayerGuess(roomId, playerId, currentGuess);

        setGameState(response.gameState);
        setCurrentGuess('');

        if (response.gameState.status === 'finished') {
          onGameFinished(response.gameState);
        } else if (currentPlayer && currentPlayer.hasWon) {
          setMessage('You guessed correctly! Waiting for opponent...');
        } else {
          setMessage(`+${response.score} points! Keep guessing...`);
        }
      } catch (error: any) {
        setMessage(error.message || 'Error submitting guess');
      } finally {
        setIsLoading(false);
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  if (!gameState || !currentPlayer || !opponent) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontSize: '18px',
          color: '#787c7e',
        }}
      >
        Loading game...
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f8f8',
            borderRadius: '8px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: 0,
              }}
            >
              MULTIPLAYER WORDLE
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: '#787c7e',
                margin: '5px 0 0 0',
              }}
            >
              Room: {roomCode}
            </p>
          </div>
          <div style={{ fontSize: '14px', textAlign: 'right' }}>
            <div>Round: {gameState.currentMaxRound}/{gameState.maxRounds}</div>
          </div>
        </div>

        <div
          style={{
            fontSize: '18px',
            textAlign: 'center',
            height: '30px',
            marginBottom: '20px',
            fontWeight: hasPlayerFinished ? 'bold' : 'normal',
            color: hasPlayerFinished ? '#6aaa64' : '#000000',
          }}
        >
          {message}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px',
            marginBottom: '30px',
          }}
        >
          {/* Current Player Board */}
          <div
            style={{
              border: `3px solid ${currentPlayer.hasWon ? '#6aaa64' : '#d3d6da'}`,
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#ffffff',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                {playerName} (You)
              </h2>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#6aaa64',
                }}
              >
                Score: {currentPlayer.score}
              </div>
            </div>
            {currentPlayer.hasWon && (
              <div
                style={{
                  padding: '8px',
                  backgroundColor: '#6aaa64',
                  color: '#ffffff',
                  textAlign: 'center',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                WON!
              </div>
            )}
            <GameBoard
              guesses={currentPlayer.guesses}
              currentGuess={hasPlayerFinished ? '' : currentGuess}
              maxRounds={gameState.maxRounds}
            />
          </div>

          {/* Opponent Board */}
          <div
            style={{
              border: `3px solid ${opponent.hasWon ? '#6aaa64' : '#d3d6da'}`,
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#f8f8f8',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                {opponent.playerName}
              </h2>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#c9b458',
                }}
              >
                Score: {opponent.score}
              </div>
            </div>
            {opponent.hasWon && (
              <div
                style={{
                  padding: '8px',
                  backgroundColor: '#6aaa64',
                  color: '#ffffff',
                  textAlign: 'center',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                WON!
              </div>
            )}
            <GameBoard
              guesses={opponent.guesses}
              currentGuess=""
              maxRounds={gameState.maxRounds}
            />
          </div>
        </div>

        {/* Leaderboard */}
        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f8f8',
            borderRadius: '8px',
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '10px',
            }}
          >
            Leaderboard
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...gameState.players]
              .sort((a, b) => {
                if (a.hasWon && !b.hasWon) return -1;
                if (!a.hasWon && b.hasWon) return 1;
                return b.score - a.score;
              })
              .map((player, index) => (
                <div
                  key={player.playerId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <span>
                    {index + 1}. {player.playerName} {player.playerId === playerId ? '(You)' : ''}
                  </span>
                  <span style={{ fontWeight: 'bold' }}>
                    {player.score} pts {player.hasWon ? '✓' : ''}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {!hasPlayerFinished && (
          <Keyboard onKeyPress={handleKeyPress} guesses={currentPlayer.guesses} />
        )}

        {hasPlayerFinished && !isGameOver && (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: '#f8f8f8',
              borderRadius: '8px',
              fontSize: '16px',
              color: '#787c7e',
            }}
          >
            Waiting for opponent to finish...
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGame;
