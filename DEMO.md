# Wordle Full-Stack Application Demo

## Application is Running

### Backend Server
- **URL**: http://localhost:3001
- **Status**: Running successfully
- **Configuration**: Max Rounds = 6, Word List Size = 50

### Frontend Application
- **URL**: http://localhost:3000
- **Status**: Running successfully
- **Build**: Compiled successfully

## Features Demonstrated

### 1. Backend API Endpoints

#### Start New Game
```bash
POST /api/game/new
Response: {"gameId":"...","guesses":[],"isWon":false,"isLost":false,"isOver":false,"remainingRounds":6}
```

#### Submit Guess
```bash
POST /api/game/:gameId/guess
Body: {"guess":"APPLE"}
Response: Returns guess result with letter statuses (hit/present/miss)
```

#### Get Configuration
```bash
GET /api/config
Response: {"maxRounds":6,"wordListSize":50}
```

### 2. Game Logic

The backend correctly implements Wordle scoring:

**Example Game Tested:**
- **Guess 1**: "APPLE"
  - Result: A(miss), P(miss), P(miss), L(present), E(miss)
  - Indicates: L is in the word but not at position 4

- **Guess 2**: "LIGHT"
  - Result: L(present), I(miss), G(miss), H(miss), T(miss)
  - Indicates: L is still in the word but not at position 1

This demonstrates the correct implementation of the Wordle algorithm:
1. Exact matches (hits) are identified first
2. Letters in wrong positions (present) are identified next
3. Remaining letters are marked as misses
4. Duplicate letter handling follows Wordle rules

### 3. Frontend UI Features

The React application provides:

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

### 4. Configuration System

The application supports configuration of:
- **Maximum Rounds**: Default 6, configurable via API
- **Word List**: 50 words by default, fully customizable

### 5. Game States

Properly handles all game states:
- **In Progress**: Accepting guesses
- **Won**: Player guessed correctly
- **Lost**: Player ran out of rounds
- **Game Over**: No more guesses accepted

## How the UI Interacts with Backend

### 1. Game Initialization
When the app loads:
```typescript
// Frontend calls
const config = await getConfig(); // GET /api/config
const game = await startNewGame(); // POST /api/game/new
```

### 2. Submitting Guesses
When player presses Enter:
```typescript
// Frontend calls
const response = await submitGuess(gameId, guess);
// POST /api/game/:gameId/guess

// Backend responds with:
// - Guess result (letter-by-letter status)
// - All previous guesses
// - Win/lose/over flags
// - Remaining rounds
// - Answer (if game is over)
```

### 3. State Management
The frontend maintains:
- Current game ID
- All previous guesses
- Current incomplete guess
- Game status (won/lost/over)
- UI message

### 4. Real-time Updates
- Each guess is immediately sent to backend
- Backend evaluates and returns results
- Frontend updates UI with colored tiles
- Keyboard colors update based on letter status

## Testing the Application

### Open the Application
Navigate to http://localhost:3000 in your browser

### Play a Game
1. You'll see an empty 6x5 grid
2. Start typing a 5-letter word
3. Press Enter to submit
4. Observe the color feedback
5. Continue until you win or lose
6. Click "Play Again" to start over

### API Testing
Use curl or Postman to test the backend directly:

```bash
# Start a new game
curl -X POST http://localhost:3001/api/game/new

# Submit a guess (replace gameId)
curl -X POST http://localhost:3001/api/game/GAME_ID/guess \
  -H "Content-Type: application/json" \
  -d '{"guess":"APPLE"}'

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
- Reusable React components
- Clear API interface

### Scalability
- In-memory game storage (can be replaced with database)
- RESTful API design
- Stateless frontend

### User Experience
- Responsive design
- Immediate feedback
- Intuitive controls
- Clear visual indicators

## Requirements Met

### Task 1: Normal Wordle
- ✅ 5-letter word selection from configurable list
- ✅ English alphabet only, case-insensitive
- ✅ Correct scoring: Hit (green), Present (yellow), Miss (gray)
- ✅ Follows official Wordle rules

### Configuration Requirements
- ✅ Configurable maximum rounds (default: 6)
- ✅ Configurable word list (50 words included)

### Win/Lose Detection
- ✅ Win: Guess correct word within max rounds
- ✅ Lose: Fail to guess after max rounds
- ✅ Proper game over state handling

### Technology Stack
- ✅ Node.js backend
- ✅ React.js frontend
- ✅ TypeScript throughout
- ✅ Express API
- ✅ Full stack integration

## Conclusion

The application is fully functional and demonstrates:
1. Complete Wordle game implementation
2. Proper frontend-backend communication
3. Accurate game logic following Wordle rules
4. Clean, maintainable code structure
5. Good user experience

Both servers are running and ready for use!
