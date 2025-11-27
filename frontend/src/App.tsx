import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import { startNewGame, submitGuess, getConfig } from './api';
import { GuessResult } from './types';

const App: React.FC = () => {
  const [gameId, setGameId] = useState<string>('');
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isLost, setIsLost] = useState<boolean>(false);
  const [isOver, setIsOver] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>('');
  const [maxRounds, setMaxRounds] = useState<number>(6);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOver) return;

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
  }, [currentGuess, isOver]);

  const initializeGame = async () => {
    try {
      setIsLoading(true);
      const config = await getConfig();
      setMaxRounds(config.maxRounds);

      const game = await startNewGame();
      setGameId(game.gameId);
      setGuesses([]);
      setCurrentGuess('');
      setIsWon(false);
      setIsLost(false);
      setIsOver(false);
      setAnswer('');
      setMessage('Start guessing!');
    } catch (error) {
      setMessage('Error starting game. Make sure the backend is running.');
      console.error('Error initializing game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = async (key: string) => {
    if (isOver) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setMessage('Word must be 5 letters');
        return;
      }

      try {
        setIsLoading(true);
        const response = await submitGuess(gameId, currentGuess);

        setGuesses(response.guesses);
        setCurrentGuess('');
        setIsWon(response.isWon);
        setIsLost(response.isLost);
        setIsOver(response.isOver);

        if (response.isWon) {
          setMessage('Congratulations! You won!');
          setAnswer(response.answer || '');
        } else if (response.isLost) {
          setMessage(`Game Over! The word was: ${response.answer}`);
          setAnswer(response.answer || '');
        } else {
          setMessage(`${response.remainingRounds} guesses remaining`);
        }
      } catch (error: any) {
        setMessage(error.message || 'Error submitting guess');
        console.error('Error submitting guess:', error);
      } finally {
        setIsLoading(false);
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess((prev) => prev + key);
    }
  };

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
      <h1
        style={{
          fontSize: '36px',
          fontWeight: 'bold',
          margin: '10px 0',
          borderBottom: '1px solid #d3d6da',
          paddingBottom: '10px',
          width: '500px',
          textAlign: 'center',
        }}
      >
        WORDLE
      </h1>

      <div
        style={{
          fontSize: '18px',
          marginTop: '10px',
          height: '30px',
          fontWeight: isWon || isLost ? 'bold' : 'normal',
          color: isWon ? '#6aaa64' : isLost ? '#787c7e' : '#000000',
        }}
      >
        {message}
      </div>

      {isLoading && (
        <div style={{ fontSize: '16px', color: '#787c7e', marginTop: '10px' }}>
          Loading...
        </div>
      )}

      <GameBoard guesses={guesses} currentGuess={currentGuess} maxRounds={maxRounds} />

      <Keyboard onKeyPress={handleKeyPress} guesses={guesses} />

      {isOver && (
        <button
          onClick={initializeGame}
          style={{
            marginTop: '30px',
            padding: '15px 30px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: '#6aaa64',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Play Again
        </button>
      )}

      <div
        style={{
          marginTop: '30px',
          fontSize: '14px',
          color: '#787c7e',
          textAlign: 'center',
        }}
      >
        <div>Max Rounds: {maxRounds}</div>
        <div style={{ marginTop: '10px' }}>
          Use your keyboard or click the on-screen keyboard to play
        </div>
      </div>
    </div>
  );
};

export default App;
