const PLAYER_COLORS = ['#ff4444','#4488ff','#44ff88','#ffdd44','#aa44ff','#ff8844','#ff44aa','#44ffff'];

const rooms = {};

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function generatePlayerId() {
  return Math.random().toString(36).substr(2, 9);
}

function createRoom(playerName, socketId) {
  let code;
  do { code = generateRoomCode(); } while (rooms[code]);

  const playerId = generatePlayerId();
  const player = {
    id: playerId,
    socketId,
    name: playerName,
    color: PLAYER_COLORS[0],
    isAlive: true,
    isHost: true,
    role: null,
    score: 0,
  };

  rooms[code] = {
    id: code,
    players: [player],
    gameState: 'lobby',
    currentRound: 1,
    maxRounds: 4,
    currentCode: '',
    currentChallengeIndex: 0,
    commits: [],
    votes: {},
    meetingsLeft: 2,
    saboteurId: null,
    sabotagesCompleted: 0,
    sabotagesRequired: 3,
    timer: null,
    timerSeconds: 180,
    testResults: [],
    chatMessages: [],
  };

  return { room: rooms[code], player };
}

function joinRoom(roomCode, playerName, socketId) {
  const room = rooms[roomCode];
  if (!room) return { error: 'Room not found' };
  if (room.gameState !== 'lobby') return { error: 'Game already in progress' };
  if (room.players.length >= 8) return { error: 'Room is full' };

  const playerId = generatePlayerId();
  const color = PLAYER_COLORS[room.players.length % PLAYER_COLORS.length];
  const player = {
    id: playerId,
    socketId,
    name: playerName,
    color,
    isAlive: true,
    isHost: false,
    role: null,
    score: 0,
  };

  room.players.push(player);
  return { room, player };
}

function assignRoles(roomCode) {
  const room = rooms[roomCode];
  if (!room) return null;
  const playerCount = room.players.length;
  const saboteurIndex = Math.floor(Math.random() * playerCount);
  room.players.forEach((p, i) => {
    p.role = i === saboteurIndex ? 'saboteur' : 'crewmate';
  });
  room.saboteurId = room.players[saboteurIndex].id;
  return room;
}

function getRoom(roomCode) {
  return rooms[roomCode] || null;
}

function getPlayerBySocket(socketId) {
  for (const room of Object.values(rooms)) {
    const player = room.players.find(p => p.socketId === socketId);
    if (player) return { player, room };
  }
  return null;
}

function removePlayer(socketId) {
  for (const [code, room] of Object.entries(rooms)) {
    const idx = room.players.findIndex(p => p.socketId === socketId);
    if (idx !== -1) {
      const player = room.players[idx];
      room.players.splice(idx, 1);
      if (room.players.length === 0) {
        if (room.timer) clearInterval(room.timer);
        delete rooms[code];
      } else if (player.isHost && room.players.length > 0) {
        room.players[0].isHost = true;
      }
      return { player, room, roomCode: code };
    }
  }
  return null;
}

function addCommit(roomCode, playerName, summary, oldCode, newCode) {
  const room = rooms[roomCode];
  if (!room) return null;
  const commit = {
    id: Date.now(),
    playerName,
    summary,
    timestamp: new Date().toLocaleTimeString(),
    diff: generateDiff(oldCode, newCode),
  };
  room.commits.unshift(commit);
  if (room.commits.length > 20) room.commits.pop();
  return commit;
}

function generateDiff(oldCode, newCode) {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const diff = [];
  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    if (oldLines[i] !== newLines[i]) {
      if (oldLines[i] !== undefined) diff.push({ type: 'removed', line: oldLines[i], lineNum: i + 1 });
      if (newLines[i] !== undefined) diff.push({ type: 'added', line: newLines[i], lineNum: i + 1 });
    }
  }
  return diff.slice(0, 10);
}

module.exports = { createRoom, joinRoom, assignRoles, getRoom, getPlayerBySocket, removePlayer, addCommit };
