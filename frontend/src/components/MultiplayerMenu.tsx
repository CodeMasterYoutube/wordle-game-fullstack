import React, { useState } from 'react';
import { createRoom, joinRoom } from '../api';

interface MultiplayerMenuProps {
  onRoomCreated: (roomId: string, roomCode: string, playerId: string, playerName: string) => void;
  onRoomJoined: (roomId: string, roomCode: string, playerId: string, playerName: string) => void;
  onBack: () => void;
}

const MultiplayerMenu: React.FC<MultiplayerMenuProps> = ({
  onRoomCreated,
  onRoomJoined,
  onBack,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await createRoom(playerName.trim());
      onRoomCreated(response.roomId, response.roomCode, response.playerId, response.playerName);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const response = await joinRoom(playerName.trim(), roomCode.trim().toUpperCase());
      onRoomJoined(response.roomId, response.roomCode, response.playerId, response.playerName);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
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
      <h1
        style={{
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '10px',
        }}
      >
        MULTIPLAYER WORDLE
      </h1>

      <p
        style={{
          fontSize: '16px',
          color: '#787c7e',
          marginBottom: '30px',
        }}
      >
        Compete with a friend to guess the same word!
      </p>

      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#f8f8f8',
          padding: '30px',
          borderRadius: '8px',
          border: '1px solid #d3d6da',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            placeholder="Enter your name"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #d3d6da',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateRoom();
              }
            }}
          />
        </div>

        <button
          onClick={handleCreateRoom}
          disabled={isCreating}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: isCreating ? '#d3d6da' : '#6aaa64',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: isCreating ? 'not-allowed' : 'pointer',
            marginBottom: '30px',
          }}
        >
          {isCreating ? 'Creating Room...' : 'Create New Room'}
        </button>

        <div
          style={{
            borderTop: '1px solid #d3d6da',
            paddingTop: '30px',
          }}
        >
          <p
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#787c7e',
              marginBottom: '20px',
            }}
          >
            OR
          </p>

          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            Room Code
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="Enter 6-digit code"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #d3d6da',
              borderRadius: '4px',
              boxSizing: 'border-box',
              marginBottom: '15px',
              textTransform: 'uppercase',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleJoinRoom();
              }
            }}
          />

          <button
            onClick={handleJoinRoom}
            disabled={isJoining}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: isJoining ? '#d3d6da' : '#c9b458',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: isJoining ? 'not-allowed' : 'pointer',
            }}
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        </div>

        {error && (
          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '4px',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}
      </div>

      <button
        onClick={onBack}
        style={{
          marginTop: '30px',
          padding: '12px 30px',
          fontSize: '16px',
          backgroundColor: 'transparent',
          color: '#787c7e',
          border: '2px solid #787c7e',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Back to Main Menu
      </button>
    </div>
  );
};

export default MultiplayerMenu;
