import { GameResponse, ConfigResponse } from './types';

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
