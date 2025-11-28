# Wordle Full-Stack Application Demo

## Application is Running

### Backend Server
- **URL**: http://localhost:3001
- **Status**: Running successfully
- **Configuration**: Max Rounds = 6, Word List Size = 50
- **Endpoints**:
  - Single-player: `/api/game/*`
  - Multiplayer: `/api/multiplayer/*`
  - Config: `/api/config`

### Frontend Application
- **URL**: http://localhost:3000
- **Status**: Running successfully
- **Build**: Compiled successfully with Webpack 5
- **Hot Reload**: Enabled for rapid development

## New Features Implemented

### Multiplayer Mode
The application now includes a fully functional multiplayer mode with the following features:

#### 1. Turn-Based Gameplay
- **Strict Turn Enforcement**: Backend validates that only the current player can submit guesses
- **Random Starter**: System randomly selects which player goes first when game begins
- **Turn Indicators**: Clear visual feedback showing whose turn it is
- **Automatic Turn Switching**: Turns alternate automatically after each guess

#### 2. Real-Time Room System
- **Room Creation**: Host creates a room and receives a 6-character code
- **Room Joining**: Guest joins using the room code
- **Waiting Lobby**: Host waits with real-time updates when second player joins
- **Auto-Start**: Game starts automatically when both players are ready
- **Live Polling**: Frontend polls every 1.5 seconds for game state updates

#### 3. Competitive Scoring
- **Hit (Green)**: 2 points per letter
- **Present (Yellow)**: 1 point per letter
- **Miss (Gray)**: 0 points
- **Leaderboard**: Real-time score tracking displayed during game
- **Win Conditions**: Multiple tiebreaker rules determine the winner

## Features Demonstrated

### 1. Backend API Endpoints

#### Single-Player Endpoints

**Start New Game**
```bash
POST /api/game/new
Response: {
  "gameId": "uuid",
  "guesses": [],
  "isWon": false,
  "isLost": false,
  "isOver": false,
  "remainingRounds": 6
}
```

**Submit Guess**
```bash
POST /api/game/:gameId/guess
Body: {"guess": "APPLE"}
Response: Returns guess result with letter statuses (hit/present/miss)
```

**Get Configuration**
```bash
GET /api/config
Response: {"maxRounds": 6, "wordListSize": 50}
```

#### Multiplayer Endpoints

**Create Room**
```bash
POST /api/multiplayer/room/create
Body: {"playerName": "Player1"}
Response: {
  "roomId": "uuid",
  "roomCode": "ABC123",
  "playerId": "uuid",
  "playerName": "Player1"
}
```

**Join Room**
```bash
POST /api/multiplayer/room/join
Body: {"playerName": "Player2", "roomCode": "ABC123"}
Response: {
  "roomId": "uuid",
  "roomCode": "ABC123",
  "playerId": "uuid",
  "playerName": "Player2",
  "players": [...]
}
```

**Submit Multiplayer Guess**
```bash
POST /api/multiplayer/game/:roomId/guess
Body: {"playerId": "uuid", "guess": "APPLE"}
Response: {
  "success": true,
  "guessResult": {...},
  "score": 3,
  "totalScore": 8,
  "gameState": {
    "currentTurnPlayerId": "uuid",
    "players": [...],
    "status": "playing"
  }
}
```

**Get Game State (Polling)**
```bash
GET /api/multiplayer/game/:roomId/state
Response: {
  "roomId": "uuid",
  "roomCode": "ABC123",
  "players": [...],
  "currentTurnPlayerId": "uuid",
  "status": "playing",
  "currentMaxRound": 2,
  "maxRounds": 6
}
```

### 2. Game Logic

The backend correctly implements Wordle scoring:

**Example Single-Player Game:**
- **Guess 1**: "APPLE"
  - Result: A(miss), P(miss), P(miss), L(present), E(miss)
  - Indicates: L is in the word but not at position 4

- **Guess 2**: "LIGHT"
  - Result: L(present), I(miss), G(miss), H(miss), T(miss)
  - Indicates: L is still in the word but not at position 1

**Example Multiplayer Game:**
- **Player 1 Turn**: Guesses "CRANE" → Score: 4 points (1 hit, 2 present)
- **Player 2 Turn**: Guesses "SLATE" → Score: 6 points (2 hit, 2 present)
- Turns continue to alternate
- Final winner determined by scoring rules

This demonstrates the correct implementation of the Wordle algorithm:
1. Exact matches (hits) are identified first
2. Letters in wrong positions (present) are identified next
3. Remaining letters are marked as misses
4. Duplicate letter handling follows Wordle rules
5. Turn validation ensures fair play

### 3. Frontend UI Features

#### Mode Selection Screen
- **Play Solo**: Start single-player game
- **Play with Friend**: Enter multiplayer mode
- Clean, centered design with clear options

#### Single-Player Features
1. **Interactive Game Board**
   - 6 rows of 5 tiles each (configurable)
   - Color-coded feedback:
     - Green tiles: Correct letter, correct position (hit)
     - Yellow tiles: Correct letter, wrong position (present)
     - Gray tiles: Letter not in word (miss)
     - White tiles: Empty/unused

2. **Virtual Keyboard**
   - All alphabet letters displayed
   - ENTER and BACKSPACE buttons
   - Keys change color based on letter status
   - Same color scheme as tiles for consistency

3. **Physical Keyboard Support**
   - Type letters directly
   - Press Enter to submit
   - Press Backspace to delete

4. **Game Status**
   - Current message display
   - Remaining rounds counter
   - Win/lose detection
   - Answer reveal on game over

5. **Play Again**
   - Button appears after game ends
   - Starts fresh game with new word

#### Multiplayer Features

1. **Multiplayer Menu**
   - Enter player name (required, max 20 characters)
   - Create new room button
   - Join existing room with code input
   - Clear error messaging

2. **Room Lobby (Host Waiting)**
   - Displays room code prominently
   - Shows player count (X/2)
   - Visual player indicators
   - "Start Game" button (enabled when 2 players ready)
   - Real-time updates via polling

3. **Multiplayer Game Interface**
   - **Dual Game Boards**: Side-by-side view of both players
   - **Turn Indicators**:
     - "You start first!" when you're selected
     - "[Player Name] starts first!" when opponent selected
     - "[Player Name]'s turn..." during opponent's turn
   - **Visual Distinctions**:
     - Your board: White background, green border when won
     - Opponent board: Gray background, visible but read-only
   - **Score Display**: Real-time score for both players
   - **Leaderboard**: Sorted by win status and score
   - **Keyboard Management**:
     - Shown only when it's your turn
     - Hidden with waiting message when opponent's turn
   - **Status Badges**: "WON!" badge appears on player boards

4. **Multiplayer Results Screen**
   - Winner announcement or tie declaration
   - Final scores for both players
   - Complete statistics (rounds used, guessed correctly)
   - Answer reveal
   - "Play Again" and "Main Menu" buttons

### 4. Turn-Based System Implementation

#### Backend Turn Management
**File**: `backend/src/multiplayerManager.ts`

- **Random Selection** (Line 130-131):
  ```typescript
  const randomIndex = Math.floor(Math.random() * 2);
  room.currentTurnPlayerId = room.players[randomIndex].playerId;
  ```

- **Turn Validation** (Line 175-177):
  ```typescript
  if (room.currentTurnPlayerId && room.currentTurnPlayerId !== playerId) {
    throw new Error('It is not your turn');
  }
  ```

- **Turn Switching** (Line 200-204):
  ```typescript
  const otherPlayer = room.players.find(p => p.playerId !== playerId);
  if (otherPlayer && otherPlayer.status === 'playing') {
    room.currentTurnPlayerId = otherPlayer.playerId;
  }
  ```

#### Frontend Turn Indicators
**File**: `frontend/src/components/MultiplayerGame.tsx`

- **Turn Detection** (Line 31):
  ```typescript
  const isMyTurn = gameState?.currentTurnPlayerId === playerId;
  ```

- **Initial Message** (Lines 40-49):
  ```typescript
  if (!hasShownStartMessage && state.currentTurnPlayerId) {
    if (state.currentTurnPlayerId === playerId) {
      setMessage('You start first! Make your guess.');
    } else {
      setMessage(`${startingPlayer?.playerName} starts first!`);
    }
  }
  ```

- **Keyboard Visibility** (Line 365):
  ```typescript
  {!hasPlayerFinished && isMyTurn && (
    <Keyboard onKeyPress={handleKeyPress} guesses={currentPlayer.guesses} />
  )}
  ```

- **Waiting Message** (Lines 369-383):
  ```typescript
  {!hasPlayerFinished && !isMyTurn && (
    <div>Waiting for {opponent?.playerName} to play their turn...</div>
  )}
  ```

### 5. Real-Time Polling System

#### Lobby Polling
**File**: `frontend/src/App.tsx` (Lines 92-119)

```typescript
useEffect(() => {
  if (gameMode !== 'multiplayer-lobby' || !roomId) return;

  const pollRoomState = async () => {
    const state = await getGameState(roomId);
    setPlayersCount(state.players.length);

    if (state.status === 'playing') {
      setGameMode('multiplayer-game');
    }
  };

  pollRoomState();
  const interval = setInterval(pollRoomState, 1500);
  return () => clearInterval(interval);
}, [gameMode, roomId]);
```

#### Game State Polling
**File**: `frontend/src/components/MultiplayerGame.tsx` (Lines 35-57)

```typescript
const pollGameState = useCallback(async () => {
  const state = await getGameState(roomId);
  setGameState(state);

  if (state.status === 'finished') {
    onGameFinished(state);
  }
}, [roomId, onGameFinished, playerId, hasShownStartMessage]);

useEffect(() => {
  pollGameState();
  const interval = setInterval(pollGameState, 1500);
  return () => clearInterval(interval);
}, [pollGameState]);
```

### 6. Configuration System

The application supports configuration of:
- **Maximum Rounds**: Default 6, configurable via API
- **Word List**: 50 words by default, fully customizable

### 7. Game States

Properly handles all game states:
- **Single-Player**: In Progress, Won, Lost, Game Over
- **Multiplayer**: Waiting, Playing, Finished
- **Player Status**: Waiting, Playing, Won, Finished

## How the UI Interacts with Backend

### 1. Single-Player Flow
**Game Initialization:**
```typescript
const config = await getConfig();        // GET /api/config
const game = await startNewGame();       // POST /api/game/new
```

**Submitting Guesses:**
```typescript
const response = await submitGuess(gameId, guess);
// POST /api/game/:gameId/guess
```

### 2. Multiplayer Flow

**Creating a Room:**
```typescript
const response = await createRoom(playerName);
// POST /api/multiplayer/room/create
// Returns: roomId, roomCode, playerId
```

**Joining a Room:**
```typescript
const response = await joinRoom(playerName, roomCode);
// POST /api/multiplayer/room/join
// Game auto-starts on backend when 2 players join
```

**Lobby Polling (Host):**
```typescript
const state = await getGameState(roomId);
// GET /api/multiplayer/game/:roomId/state
// Polls every 1.5s to detect when player 2 joins
```

**Submitting Multiplayer Guess:**
```typescript
const response = await submitMultiplayerGuess(roomId, playerId, guess);
// POST /api/multiplayer/game/:roomId/guess
// Backend validates it's the player's turn
// Returns updated game state with new currentTurnPlayerId
```

**Game State Polling (Both Players):**
```typescript
const state = await getGameState(roomId);
// GET /api/multiplayer/game/:roomId/state
// Polls every 1.5s for opponent moves and turn updates
```

### 3. State Management

**Single-Player State:**
- Current game ID
- All previous guesses
- Current incomplete guess
- Game status (won/lost/over)
- UI message

**Multiplayer State:**
- Room ID and code
- Player ID and name
- Both players' progress
- Current turn player ID
- Scores and leaderboard
- Game status

### 4. Real-Time Updates
- Each guess is immediately sent to backend
- Backend evaluates and returns results
- Backend switches turn automatically
- Frontend updates UI with colored tiles
- Keyboard colors update based on letter status
- Turn indicators update in real-time
- Opponent's moves appear via polling

## Testing the Application

### Open the Application
Navigate to http://localhost:3000 in your browser

### Test Single-Player Mode
1. Click "Play Solo"
2. You'll see an empty 6x5 grid
3. Start typing a 5-letter word
4. Press Enter to submit
5. Observe the color feedback
6. Continue until you win or lose
7. Click "Play Again" to start over

### Test Multiplayer Mode

**As Host:**
1. Click "Play with Friend"
2. Enter your name (e.g., "Alice")
3. Click "Create New Room"
4. Note the 6-character room code
5. Share code with friend
6. Wait in lobby (shows "Players 1/2")
7. When friend joins, game starts automatically
8. System announces who starts first
9. If you start: Type and submit guess
10. If opponent starts: See "[Friend] starts first!" message
11. Take turns until game ends
12. View results screen

**As Guest:**
1. Open app in another browser/tab
2. Click "Play with Friend"
3. Enter your name (e.g., "Bob")
4. Enter room code from host
5. Click "Join Room"
6. Game starts immediately
7. Follow turn-based gameplay

### API Testing
Use curl or Postman to test the backend directly:

```bash
# Start a single-player game
curl -X POST http://localhost:3001/api/game/new

# Submit a guess (replace gameId)
curl -X POST http://localhost:3001/api/game/GAME_ID/guess \
  -H "Content-Type: application/json" \
  -d '{"guess":"APPLE"}'

# Create multiplayer room
curl -X POST http://localhost:3001/api/multiplayer/room/create \
  -H "Content-Type: application/json" \
  -d '{"playerName":"TestPlayer"}'

# Join multiplayer room (replace roomCode)
curl -X POST http://localhost:3001/api/multiplayer/room/join \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Player2","roomCode":"ABC123"}'

# Get game state (replace roomId)
curl http://localhost:3001/api/multiplayer/game/ROOM_ID/state

# Get configuration
curl http://localhost:3001/api/config
```

## Project Highlights

### TypeScript Throughout
- Full type safety in both backend and frontend
- Shared type definitions for API contracts
- Better developer experience and fewer bugs

### Clean Architecture
- Separated game logic from API routes
- Multiplayer manager for room and turn management
- Reusable React components
- Clear API interface

### Scalability
- In-memory game storage (can be replaced with database)
- RESTful API design
- Stateless frontend with polling
- Room cleanup system for memory management

### User Experience
- Responsive design
- Immediate feedback
- Intuitive controls
- Clear visual indicators
- Real-time multiplayer updates
- Strict turn enforcement prevents confusion

### Robust Turn System
- Backend validation prevents cheating
- Frontend disables input during opponent's turn
- Clear visual feedback for current turn
- Random starter for fairness
- Automatic turn switching

## Implementation Highlights

### Room Management
- **6-Character Codes**: Alphanumeric with collision detection
- **Auto-Cleanup**: Rooms older than 30 minutes are deleted every 10 minutes
- **Status Tracking**: `waiting` → `playing` → `finished`

### Player Management
- **Player Status**: `waiting` → `playing` → `won`/`finished`
- **Score Calculation**: Real-time based on guess results
- **Win Condition Logic**: Multi-tiered tiebreaker system

### Polling Strategy
- **Lobby**: 1.5-second intervals to detect player joins
- **Game**: 1.5-second intervals for move synchronization
- **Cleanup**: On component unmount to prevent memory leaks

## Requirements Met

### Task 1: Normal Wordle
- ✅ 5-letter word selection from configurable list
- ✅ English alphabet only, case-insensitive
- ✅ Correct scoring: Hit (green), Present (yellow), Miss (gray)
- ✅ Follows official Wordle rules

### Task 2: Multiplayer Wordle
- ✅ Two-player competitive mode
- ✅ Room creation and joining system
- ✅ Turn-based gameplay with strict enforcement
- ✅ Random starter selection
- ✅ Real-time game state synchronization
- ✅ Competitive scoring system
- ✅ Winner determination with tiebreakers
- ✅ Visual turn indicators
- ✅ Waiting lobby with auto-start

### Configuration Requirements
- ✅ Configurable maximum rounds (default: 6)
- ✅ Configurable word list (50 words included)

### Win/Lose Detection
- ✅ Win: Guess correct word within max rounds
- ✅ Lose: Fail to guess after max rounds
- ✅ Multiplayer: Complex winner determination
- ✅ Proper game over state handling

### Technology Stack
- ✅ Node.js backend with Express
- ✅ React.js frontend
- ✅ TypeScript throughout
- ✅ Full stack integration
- ✅ RESTful API
- ✅ Real-time updates via polling

## Conclusion

The application is fully functional and demonstrates:
1. Complete Wordle game implementation for single-player
2. Full-featured multiplayer mode with turn-based gameplay
3. Proper frontend-backend communication with polling
4. Accurate game logic following Wordle rules
5. Clean, maintainable code structure
6. Robust turn validation and enforcement
7. Real-time game state synchronization
8. Excellent user experience with clear visual feedback
9. Scalable architecture ready for database integration

Both servers are running and ready for use!

**Backend**: http://localhost:3001
**Frontend**: http://localhost:3000
