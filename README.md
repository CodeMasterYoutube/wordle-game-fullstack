# Wordle Full-Stack Application

A full-stack implementation of the popular Wordle game using Node.js, Express, React, and TypeScript with both single-player and multiplayer modes.

## Features

### Single-Player Mode
- Full Wordle gameplay with hit/present/miss feedback
- Configurable maximum number of rounds (default: 6)
- Configurable word list (default: 50 five-letter words)
- Interactive keyboard with color-coded letter status
- Physical keyboard support
- Win/lose detection
- Play again functionality

### Multiplayer Mode
- **Turn-Based Gameplay**: Players alternate turns with strict enforcement
- **Random Starter**: System randomly selects which player goes first
- **Real-Time Room System**: Create and join game rooms with unique 6-character codes
- **Live Updates**: Automatic polling for game state changes every 1.5 seconds
- **Competitive Scoring**: Points awarded based on guess accuracy
  - Hit (green): 2 points
  - Present (yellow): 1 point
  - Miss (gray): 0 points
- **Win Detection**: Multiple winning conditions
  - Player who guesses correctly in fewer rounds wins
  - If both guess correctly in same rounds, highest score wins
  - If neither guesses correctly, highest score wins
- **Visual Turn Indicators**: Clear messaging showing whose turn it is
- **Waiting Lobby**: Host waits for second player with automatic game start

## Project Structure

```
Wordle-fullstack/
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── index.ts             # Main server file
│   │   ├── gameLogic.ts         # Wordle game logic
│   │   ├── config.ts            # Default configuration
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── multiplayerManager.ts # Multiplayer game management
│   │   └── multiplayerRoutes.ts  # Multiplayer API routes
│   └── package.json
└── frontend/                     # React + TypeScript UI
    ├── src/
    │   ├── components/
    │   │   ├── GameBoard.tsx           # Game board component
    │   │   ├── Keyboard.tsx            # Virtual keyboard
    │   │   ├── Tile.tsx                # Individual letter tile
    │   │   ├── ModeSelection.tsx       # Game mode selector
    │   │   ├── SinglePlayerGame.tsx    # Single-player game
    │   │   ├── MultiplayerMenu.tsx     # Multiplayer room creation/join
    │   │   ├── RoomLobby.tsx           # Waiting room for host
    │   │   ├── MultiplayerGame.tsx     # Multiplayer game interface
    │   │   └── MultiplayerResults.tsx  # Game results screen
    │   ├── App.tsx              # Main application
    │   ├── api.ts               # Backend API calls
    │   ├── types.ts             # Frontend type definitions
    │   └── index.tsx            # Entry point
    └── package.json
```

## Installation

### Option 1: Docker (Recommended - Easiest)

**Prerequisites**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**Quick Start:**
```bash
# Run the entire application with one command
docker-compose up

# Or run in background
docker-compose up -d

# Access the app:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001

# Stop the application
docker-compose down
```

**Development Mode with Hot Reload:**
```bash
docker-compose -f docker-compose.dev.yml up
```

For detailed Docker instructions, see [DOCKER.md](DOCKER.md)

### Option 2: Manual Installation

#### Backend

```bash
cd backend
npm install
npm run dev     # Development mode with ts-node
# OR
npm run build   # Build TypeScript
npm start       # Production mode
```

The backend server will run on `http://localhost:3001`

#### Frontend

```bash
cd frontend
npm install
npm start       # Development mode with webpack-dev-server
# OR
npm run build   # Production build
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## API Endpoints

### Single-Player Endpoints

#### GET /api/config
Returns the current game configuration.

**Response:**
```json
{
  "maxRounds": 6,
  "wordListSize": 50
}
```

#### POST /api/config
Updates the game configuration.

**Request Body:**
```json
{
  "maxRounds": 8,
  "wordList": ["APPLE", "BRAVE", "CRANE", ...]
}
```

#### POST /api/game/new
Starts a new single-player game.

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

#### POST /api/game/:gameId/guess
Submits a guess for the single-player game.

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

### Multiplayer Endpoints

#### POST /api/multiplayer/room/create
Creates a new multiplayer room.

**Request Body:**
```json
{
  "playerName": "Player1"
}
```

**Response:**
```json
{
  "roomId": "uuid",
  "roomCode": "ABC123",
  "playerId": "uuid",
  "playerName": "Player1"
}
```

#### POST /api/multiplayer/room/join
Joins an existing room.

**Request Body:**
```json
{
  "playerName": "Player2",
  "roomCode": "ABC123"
}
```

**Response:**
```json
{
  "roomId": "uuid",
  "roomCode": "ABC123",
  "playerId": "uuid",
  "playerName": "Player2",
  "players": [...]
}
```

#### GET /api/multiplayer/room/:roomId
Gets room information.

**Response:**
```json
{
  "roomId": "uuid",
  "roomCode": "ABC123",
  "status": "playing",
  "players": [...],
  "maxRounds": 6
}
```

#### POST /api/multiplayer/game/:roomId/guess
Submits a guess in multiplayer game.

**Request Body:**
```json
{
  "playerId": "uuid",
  "guess": "APPLE"
}
```

**Response:**
```json
{
  "success": true,
  "guessResult": {...},
  "score": 3,
  "totalScore": 8,
  "gameState": {
    "roomId": "uuid",
    "roomCode": "ABC123",
    "players": [...],
    "currentMaxRound": 2,
    "maxRounds": 6,
    "status": "playing",
    "currentTurnPlayerId": "uuid"
  }
}
```

#### GET /api/multiplayer/game/:roomId/state
Gets current game state (used for polling).

**Response:**
```json
{
  "roomId": "uuid",
  "roomCode": "ABC123",
  "players": [
    {
      "playerId": "uuid",
      "playerName": "Player1",
      "guesses": [...],
      "score": 8,
      "hasWon": false,
      "status": "playing",
      "roundsUsed": 2
    }
  ],
  "currentMaxRound": 2,
  "maxRounds": 6,
  "status": "playing",
  "currentTurnPlayerId": "uuid"
}
```

#### DELETE /api/multiplayer/room/:roomId/leave
Leaves a multiplayer room.

**Request Body:**
```json
{
  "playerId": "uuid"
}
```

## Game Rules

### Single-Player
- The game selects a random 5-letter word from the word list
- Players have a maximum number of rounds (default: 6) to guess the word
- After each guess, tiles are colored:
  - **Green (Hit)**: Letter is in the correct position
  - **Yellow (Present)**: Letter is in the word but wrong position
  - **Gray (Miss)**: Letter is not in the word
- Win: Guess the word correctly within the maximum rounds
- Lose: Fail to guess the word after using all rounds

### Multiplayer
- Two players compete to guess the same word
- **Turn-Based**: Players must alternate turns (strictly enforced)
- **Random Start**: System randomly selects who goes first
- **Scoring**:
  - Each correct letter in correct position (green): 2 points
  - Each correct letter in wrong position (yellow): 1 point
  - Incorrect letter (gray): 0 points
- **Winning Conditions** (in order of priority):
  1. Only one player guesses correctly → That player wins
  2. Both guess correctly → Player with fewer rounds wins
  3. Both guess in same rounds → Player with higher score wins
  4. Neither guesses correctly → Player with higher total score wins
  5. Tied scores → It's a tie!

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
- ts-node (for development)

### Frontend
- React 18
- TypeScript
- Webpack 5
- Babel
- webpack-dev-server (for development with hot reload)

## How to Play

### Single-Player Mode
1. Open the application at `http://localhost:3000`
2. Click "Play Solo" button
3. Start typing your 5-letter guess using your keyboard or the on-screen keyboard
4. Press Enter to submit your guess
5. Observe the color feedback:
   - Green: Correct letter in correct position
   - Yellow: Correct letter in wrong position
   - Gray: Letter not in the word
6. Continue guessing until you win or run out of attempts
7. Click "Play Again" to start a new game

### Multiplayer Mode
1. Open the application at `http://localhost:3000`
2. Click "Play with Friend" button
3. **As Host**:
   - Enter your name
   - Click "Create New Room"
   - Share the 6-character room code with your friend
   - Wait in lobby until friend joins
   - Game starts automatically when 2 players join
4. **As Guest**:
   - Enter your name
   - Enter the room code provided by host
   - Click "Join Room"
   - Game starts immediately
5. **During Game**:
   - One player is randomly selected to start
   - You'll see "You start first!" or "[Player] starts first!"
   - When it's your turn: keyboard is enabled, make your guess
   - When it's opponent's turn: keyboard is hidden, see "Waiting for [Player] to play their turn..."
   - Turns alternate strictly between players
   - Watch both boards update in real-time
   - See scores update after each guess
6. **Game End**:
   - View final results showing winner
   - See complete statistics for both players
   - Options to "Play Again" or return to "Main Menu"

## Turn-Based System

The multiplayer mode implements strict turn-based gameplay:

### Backend Turn Validation
- `currentTurnPlayerId` tracks whose turn it is
- Random selection of first player when game starts
- Server validates each guess to ensure it's the correct player's turn
- Returns error "It is not your turn" if wrong player attempts to guess
- Automatically switches turn to opponent after successful guess

### Frontend Turn Indicators
- **When it's your turn**:
  - Message: "You start first!" (initially) or previous guess result
  - Keyboard is enabled and visible
  - You can type and submit guesses
  - Your board shows current incomplete guess

- **When it's opponent's turn**:
  - Message: "[Opponent Name]'s turn..."
  - Keyboard is hidden
  - Waiting message displayed
  - Cannot type or submit guesses
  - Polling continues to show opponent's moves in real-time

### Real-Time Updates
- Frontend polls game state every 1.5 seconds
- Both players see updates immediately
- Turn switches automatically after each guess
- Game state synchronized across all clients

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

After modifying the configuration, restart the backend:

```bash
cd backend
npm run dev  # In development
# OR
npm run build && npm start  # In production
```

## Features Implementation Details

### Lobby Polling System
When host creates a room and waits, the frontend polls the server every 1.5 seconds to detect when the second player joins. This ensures the host automatically transitions from lobby to game when ready.

### Room Cleanup
The backend automatically cleans up old rooms every 10 minutes. Rooms older than 30 minutes are deleted to free up memory.

### Room Codes
6-character alphanumeric codes (A-Z, 0-9) are generated for each room with collision detection to ensure uniqueness.

### Player Status Tracking
Each player has a status: `waiting`, `playing`, `won`, or `finished`. This enables proper game flow and end-game detection.

## Development

### With Docker (Recommended)
```bash
# Start both services with hot reload
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Restart services
docker-compose -f docker-compose.dev.yml restart

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Without Docker

#### Backend Development
```bash
cd backend
npm run dev  # Uses ts-node for hot reload
```

#### Frontend Development
```bash
cd frontend
npm start  # Webpack dev server with hot module replacement
```

Both methods support hot reload for faster development.
