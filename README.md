# CODEUS — Among Us for Coders 🚀

## Setup & Run

### 1. Install server dependencies
```bash
cd server
npm install
```

### 2. Install client dependencies
```bash
cd ../client
npm install
```

### 3. Run the server (Terminal 1)
```bash
cd server
node src/index.js
```

### 4. Run the client (Terminal 2)
```bash
cd client
npm run dev
```

### 5. Open http://localhost:5173

## How to Play
- One player creates a room, shares the 6-character invite code
- Other players join using the code
- Host starts the game
- Everyone gets assigned a role (Crewmate or Saboteur)
- **Crewmates**: Fix the buggy code and pass all test cases
- **Saboteur**: Use the hidden red panel (right side) to sabotage the code
- Call Emergency Meetings to vote out suspects
- Check the Commit History for evidence!

## Features
- ✅ Live collaborative code editor (Monaco)
- ✅ Real-time cursors with player names
- ✅ Game chat
- ✅ 3 coding challenges (Easy → Hard)
- ✅ Saboteur hidden panel with 3 sabotage abilities
- ✅ Emergency meeting + voting system
- ✅ Commit history as evidence
- ✅ Round timer (server-side)
- ✅ Win condition detection
