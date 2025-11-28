import React, { useState, useEffect } from 'react';
import ModeSelection from './components/ModeSelection';
import SinglePlayerGame from './components/SinglePlayerGame';
import MultiplayerMenu from './components/MultiplayerMenu';
import RoomLobby from './components/RoomLobby';
import MultiplayerGame from './components/MultiplayerGame';
import MultiplayerResults from './components/MultiplayerResults';
import { GameStateUpdate } from './types';
import { getGameState } from './api';

type GameMode = 'menu' | 'single-player' | 'multiplayer-menu' | 'multiplayer-lobby' | 'multiplayer-game' | 'multiplayer-results';

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('menu');

  // Multiplayer state
  const [roomId, setRoomId] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playersCount, setPlayersCount] = useState<number>(1);
  const [gameState, setGameState] = useState<GameStateUpdate | null>(null);

  const handleSelectSinglePlayer = () => {
    setGameMode('single-player');
  };

  const handleSelectMultiplayer = () => {
    setGameMode('multiplayer-menu');
  };

  const handleBackToMenu = () => {
    // Reset all state
    setRoomId('');
    setRoomCode('');
    setPlayerId('');
    setPlayerName('');
    setPlayersCount(1);
    setGameState(null);
    setGameMode('menu');
  };

  const handleRoomCreated = (
    newRoomId: string,
    newRoomCode: string,
    newPlayerId: string,
    newPlayerName: string
  ) => {
    setRoomId(newRoomId);
    setRoomCode(newRoomCode);
    setPlayerId(newPlayerId);
    setPlayerName(newPlayerName);
    setPlayersCount(1);
    setGameMode('multiplayer-lobby');
  };

  const handleRoomJoined = (
    newRoomId: string,
    newRoomCode: string,
    newPlayerId: string,
    newPlayerName: string
  ) => {
    setRoomId(newRoomId);
    setRoomCode(newRoomCode);
    setPlayerId(newPlayerId);
    setPlayerName(newPlayerName);
    setPlayersCount(2);
    // Auto-start game when second player joins
    setGameMode('multiplayer-game');
  };

  const handleStartGame = () => {
    setGameMode('multiplayer-game');
  };

  const handleGameFinished = (finalGameState: GameStateUpdate) => {
    setGameState(finalGameState);
    setGameMode('multiplayer-results');
  };

  const handlePlayAgain = () => {
    // Reset and go back to multiplayer menu
    setRoomId('');
    setRoomCode('');
    setPlayerId('');
    setPlayerName('');
    setPlayersCount(1);
    setGameState(null);
    setGameMode('multiplayer-menu');
  };

  // Poll for room updates when in lobby (host waiting for players to join)
  useEffect(() => {
    if (gameMode !== 'multiplayer-lobby' || !roomId) {
      return;
    }

    const pollRoomState = async () => {
      try {
        const state = await getGameState(roomId);

        // Update player count
        setPlayersCount(state.players.length);

        // Auto-start game when status becomes 'playing'
        if (state.status === 'playing') {
          setGameMode('multiplayer-game');
        }
      } catch (error) {
        console.error('Error polling room state:', error);
      }
    };

    // Poll immediately and then every 1.5 seconds
    pollRoomState();
    const interval = setInterval(pollRoomState, 1500);

    return () => clearInterval(interval);
  }, [gameMode, roomId]);

  return (
    <>
      {gameMode === 'menu' && (
        <ModeSelection
          onSelectSinglePlayer={handleSelectSinglePlayer}
          onSelectMultiplayer={handleSelectMultiplayer}
        />
      )}

      {gameMode === 'single-player' && (
        <SinglePlayerGame onBackToMenu={handleBackToMenu} />
      )}

      {gameMode === 'multiplayer-menu' && (
        <MultiplayerMenu
          onRoomCreated={handleRoomCreated}
          onRoomJoined={handleRoomJoined}
          onBack={handleBackToMenu}
        />
      )}

      {gameMode === 'multiplayer-lobby' && (
        <RoomLobby
          roomCode={roomCode}
          playerName={playerName}
          playersCount={playersCount}
          onStartGame={handleStartGame}
        />
      )}

      {gameMode === 'multiplayer-game' && (
        <MultiplayerGame
          roomId={roomId}
          roomCode={roomCode}
          playerId={playerId}
          playerName={playerName}
          onGameFinished={handleGameFinished}
        />
      )}

      {gameMode === 'multiplayer-results' && gameState && (
        <MultiplayerResults
          gameState={gameState}
          playerId={playerId}
          onPlayAgain={handlePlayAgain}
          onMainMenu={handleBackToMenu}
        />
      )}
    </>
  );
};

export default App;
