import {
  GameResponse,
  ConfigResponse,
  CreateRoomResponse,
  JoinRoomResponse,
  MultiplayerGuessResponse,
  GameStateUpdate
} from './types';

const API_BASE_URL = 'http://localhost:3001/api';

export async function startNewGame(): Promise<GameResponse> {
  const response = await fetch(`${API_BASE_URL}/game/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to start new game');
  }

  return response.json();
}

export async function submitGuess(gameId: string, guess: string): Promise<GameResponse> {
  const response = await fetch(`${API_BASE_URL}/game/${gameId}/guess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ guess }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit guess');
  }

  return response.json();
}

export async function getConfig(): Promise<ConfigResponse> {
  const response = await fetch(`${API_BASE_URL}/config`);

  if (!response.ok) {
    throw new Error('Failed to get config');
  }

  return response.json();
}

export async function updateConfig(config: Partial<{ maxRounds: number; wordList: string[] }>): Promise<ConfigResponse> {
  const response = await fetch(`${API_BASE_URL}/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update config');
  }

  return response.json();
}

// Multiplayer API Functions

export async function createRoom(playerName: string): Promise<CreateRoomResponse> {
  const response = await fetch(`${API_BASE_URL}/multiplayer/room/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create room');
  }

  return response.json();
}

export async function joinRoom(playerName: string, roomCode: string): Promise<JoinRoomResponse> {
  const response = await fetch(`${API_BASE_URL}/multiplayer/room/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerName, roomCode }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to join room');
  }

  return response.json();
}

export async function submitMultiplayerGuess(
  roomId: string,
  playerId: string,
  guess: string
): Promise<MultiplayerGuessResponse> {
  const response = await fetch(`${API_BASE_URL}/multiplayer/game/${roomId}/guess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerId, guess }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit guess');
  }

  return response.json();
}

export async function getGameState(roomId: string): Promise<GameStateUpdate> {
  const response = await fetch(`${API_BASE_URL}/multiplayer/game/${roomId}/state`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get game state');
  }

  return response.json();
}

export async function leaveRoom(roomId: string, playerId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/multiplayer/room/${roomId}/leave`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to leave room');
  }
}
