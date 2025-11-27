# Wordle Full-Stack Application

A full-stack implementation of the popular Wordle game using Node.js, Express, React, and TypeScript.

## Features

- Full Wordle gameplay with hit/present/miss feedback
- Configurable maximum number of rounds (default: 6)
- Configurable word list (default: 50 five-letter words)
- Interactive keyboard with color-coded letter status
- Physical keyboard support
- Win/lose detection
- Play again functionality

## Project Structure

```
Wordle-fullstack/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── index.ts      # Main server file
│   │   ├── gameLogic.ts  # Wordle game logic
│   │   ├── config.ts     # Default configuration
│   │   └── types.ts      # TypeScript type definitions
│   └── package.json
└── frontend/             # React + TypeScript UI
    ├── src/
    │   ├── components/
    │   │   ├── GameBoard.tsx  # Game board component
    │   │   ├── Keyboard.tsx   # Virtual keyboard
    │   │   └── Tile.tsx       # Individual letter tile
    │   ├── App.tsx       # Main application
    │   ├── api.ts        # Backend API calls
    │   └── index.tsx     # Entry point
    └── package.json
```

## Installation

### Backend

```bash
cd backend
npm install
npm run build
npm start
```

The backend server will run on `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## API Endpoints

### GET /api/config
Returns the current game configuration.

**Response:**
```json
{
  "maxRounds": 6,
  "wordListSize": 50
}
```

### POST /api/config
Updates the game configuration.

**Request Body:**
```json
{
  "maxRounds": 8,
  "wordList": ["APPLE", "BRAVE", "CRANE", ...]
}
```

### POST /api/game/new
Starts a new game.

**Response:**
```json
{
  "gameId": "uuid",
  "guesses": [],
  "isWon": false,
  "isLost": false,
  "isOver": false,
  "remainingRounds": 6
}
```

### POST /api/game/:gameId/guess
Submits a guess for the game.

**Request Body:**
```json
{
  "guess": "APPLE"
}
```

**Response:**
```json
{
  "gameId": "uuid",
  "guessResult": {
    "guess": "APPLE",
    "result": [
      { "letter": "A", "status": "hit" },
      { "letter": "P", "status": "present" },
      { "letter": "P", "status": "miss" },
      { "letter": "L", "status": "miss" },
      { "letter": "E", "status": "hit" }
    ]
  },
  "guesses": [...],
  "isWon": false,
  "isLost": false,
  "isOver": false,
  "remainingRounds": 5
}
```

### GET /api/game/:gameId
Gets the current state of a game.

## Game Rules

- The game selects a random 5-letter word from the word list
- Players have a maximum number of rounds (default: 6) to guess the word
- After each guess, tiles are colored:
  - **Green (Hit)**: Letter is in the correct position
  - **Yellow (Present)**: Letter is in the word but wrong position
  - **Gray (Miss)**: Letter is not in the word
- Win: Guess the word correctly within the maximum rounds
- Lose: Fail to guess the word after using all rounds

## Wordle Scoring Logic

The scoring follows the official Wordle rules:

1. First pass: Mark all exact matches (hits) in green
2. Second pass: Mark remaining letters that exist in the word but are in wrong positions (present) in yellow
3. All other letters are marked as misses in gray

This ensures that duplicate letters are handled correctly according to the actual frequency of letters in the answer.

## Technologies Used

### Backend
- Node.js
- Express
- TypeScript
- uuid (for game ID generation)
- CORS (for cross-origin requests)

### Frontend
- React 18
- TypeScript
- Webpack
- Babel

## How to Play

1. Open the application at `http://localhost:3000`
2. Start typing your 5-letter guess using your keyboard or the on-screen keyboard
3. Press Enter to submit your guess
4. Observe the color feedback:
   - Green: Correct letter in correct position
   - Yellow: Correct letter in wrong position
   - Gray: Letter not in the word
5. Continue guessing until you win or run out of attempts
6. Click "Play Again" to start a new game

## Configuration

You can modify the game configuration by editing `backend/src/config.ts`:

```typescript
export const defaultConfig: GameConfig = {
  maxRounds: 6,  // Change the number of allowed guesses
  wordList: [    // Add or modify the word list
    'APPLE', 'BRAVE', 'CRANE', ...
  ]
};
```

After modifying the configuration, rebuild and restart the backend:

```bash
cd backend
npm run build
npm start
```
