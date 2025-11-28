import React from 'react';

interface RoomLobbyProps {
  roomCode: string;
  playerName: string;
  playersCount: number;
  onStartGame: () => void;
}

const RoomLobby: React.FC<RoomLobbyProps> = ({
  roomCode,
  playerName,
  playersCount,
  onStartGame,
}) => {
  const isReady = playersCount === 2;

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
        GAME LOBBY
      </h1>

      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#f8f8f8',
          padding: '40px',
          borderRadius: '8px',
          border: '1px solid #d3d6da',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            marginBottom: '30px',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: '#787c7e',
              marginBottom: '8px',
            }}
          >
            Room Code
          </p>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#6aaa64',
              letterSpacing: '8px',
              fontFamily: 'monospace',
            }}
          >
            {roomCode}
          </div>
          <p
            style={{
              fontSize: '12px',
              color: '#787c7e',
              marginTop: '8px',
            }}
          >
            Share this code with your friend
          </p>
        </div>

        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '4px',
          }}
        >
          <p
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '15px',
            }}
          >
            Players ({playersCount}/2)
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                padding: '10px 20px',
                backgroundColor: '#6aaa64',
                color: '#ffffff',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              {playerName} (You)
            </div>
            {playersCount === 2 ? (
              <div
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6aaa64',
                  color: '#ffffff',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                Player 2
              </div>
            ) : (
              <div
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#d3d6da',
                  color: '#787c7e',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                Waiting...
              </div>
            )}
          </div>
        </div>

        {isReady ? (
          <div>
            <p
              style={{
                fontSize: '16px',
                color: '#6aaa64',
                fontWeight: 'bold',
                marginBottom: '15px',
              }}
            >
              All players ready!
            </p>
            <button
              onClick={onStartGame}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: '#6aaa64',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Start Game
            </button>
          </div>
        ) : (
          <p
            style={{
              fontSize: '14px',
              color: '#787c7e',
            }}
          >
            Waiting for another player to join...
          </p>
        )}
      </div>
    </div>
  );
};

export default RoomLobby;
