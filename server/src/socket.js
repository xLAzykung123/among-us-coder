const { createRoom, joinRoom, assignRoles, getRoom, getPlayerBySocket, removePlayer, addCommit } = require('./rooms');
const { challenges, runTestCases } = require('./challenges');

function setupSockets(io) {
  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('create_room', ({ playerName }) => {
      const { room, player } = createRoom(playerName, socket.id);
      socket.join(room.id);
      socket.emit('room_created', { roomCode: room.id, player, room: safeRoom(room, player.id) });
    });

    socket.on('join_room', ({ playerName, roomCode }) => {
      const result = joinRoom(roomCode.toUpperCase(), playerName, socket.id);
      if (result.error) {
        socket.emit('join_error', { message: result.error });
        return;
      }
      const { room, player } = result;
      socket.join(room.id);
      socket.emit('room_joined', { player, room: safeRoom(room, player.id) });
      socket.to(room.id).emit('player_joined', { player: publicPlayer(player) });
    });

    socket.on('start_game', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room) return;
      const data = getPlayerBySocket(socket.id);
      if (!data || !data.player.isHost) return;

      // Initialize category voting
      room.gameState = 'category_vote';
      room.categoryVotes = {
        DATA_STRUCTURES: 0,
        OOP: 0,
        SECURITY: 0,
        FRONTEND: 0,
        ALGORITHMS: 0,
        DATABASES: 0,
      };
      room.playerCategoryVotes = {}; // { playerId: categoryId, ... }
      room.categoryVotingStartTime = Date.now();
      room.categoryVotingTimeLimit = 15000; // 15 seconds

      // Notify all players that voting has started
      io.to(roomId).emit('category_voting_started', {
        categories: Object.keys(room.categoryVotes),
      });

      // Set timer to end voting automatically
      if (room.categoryVotingTimer) clearTimeout(room.categoryVotingTimer);
      room.categoryVotingTimer = setTimeout(() => {
        selectWinningCategory(io, roomId);
      }, room.categoryVotingTimeLimit);
    });

    socket.on('cast_category_vote', ({ roomId, playerId, categoryId }) => {
      const room = getRoom(roomId);
      if (!room || room.gameState !== 'category_vote') return;
      
      // Remove previous vote if player already voted
      if (room.playerCategoryVotes[playerId]) {
        const previousCategory = room.playerCategoryVotes[playerId];
        room.categoryVotes[previousCategory] = Math.max(0, (room.categoryVotes[previousCategory] || 0) - 1);
      }

      // Add new vote
      room.playerCategoryVotes[playerId] = categoryId;
      room.categoryVotes[categoryId] = (room.categoryVotes[categoryId] || 0) + 1;

      // Broadcast updated vote counts to all players
      io.to(roomId).emit('category_vote_update', {
        votes: room.categoryVotes,
        playerVotes: room.playerCategoryVotes,
      });
    });

    socket.on('ready_to_play', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room) return;
      room.gameState = 'playing';
      startRoundTimer(io, roomId);
      io.to(roomId).emit('round_started', {
        roundNumber: room.currentRound,
        challenge: safeChallenge(challenges[room.currentChallengeIndex]),
        code: room.currentCode,
      });
    });

    socket.on('code_change', ({ roomId, code, playerId }) => {
      const room = getRoom(roomId);
      if (!room) return;
      room.currentCode = code;
      socket.to(roomId).emit('code_updated', { code, playerId });
    });

    socket.on('cursor_move', ({ roomId, playerId, line, column }) => {
      const room = getRoom(roomId);
      if (!room) return;
      const player = room.players.find(p => p.id === playerId);
      if (!player) return;
      socket.to(roomId).emit('cursor_updated', { playerId, line, column, color: player.color, name: player.name });
    });

    socket.on('send_message', ({ roomId, playerId, message }) => {
      const room = getRoom(roomId);
      if (!room) return;
      const player = room.players.find(p => p.id === playerId);
      if (!player) return;
      const msg = {
        id: Date.now(),
        playerId,
        playerName: player.name,
        color: player.color,
        message,
        timestamp: new Date().toLocaleTimeString(),
      };
      room.chatMessages.push(msg);
      io.to(roomId).emit('message_received', msg);
    });

    socket.on('commit_code', ({ roomId, playerId, code }) => {
      const room = getRoom(roomId);
      if (!room) return;
      const player = room.players.find(p => p.id === playerId);
      if (!player) return;
      const oldCode = room.currentCode;
      room.currentCode = code;
      const commit = addCommit(roomId, player.name, `${player.name} saved changes`, oldCode, code);
      io.to(roomId).emit('commit_logged', commit);
    });

    socket.on('run_tests', ({ roomId, playerId, code }) => {
      const room = getRoom(roomId);
      if (!room) return;
      const results = runTestCases(code, room.currentChallengeIndex);
      const allPassed = results.every(r => r.passed);
      room.testResults = results;
      io.to(roomId).emit('test_results', { results, allPassed, playerId });

      if (allPassed && room.gameState === 'playing') {
        endGame(io, roomId, 'crewmates', 'All test cases passed! Crewmates win!');
      }
    });

    socket.on('call_meeting', ({ roomId, playerId }) => {
      const room = getRoom(roomId);
      if (!room || room.meetingsLeft <= 0 || room.gameState !== 'playing') return;
      const player = room.players.find(p => p.id === playerId);
      if (!player || !player.isAlive) return;

      room.meetingsLeft--;
      room.gameState = 'meeting';
      room.votes = {};
      if (room.timer) { clearInterval(room.timer); room.timer = null; }

      io.to(roomId).emit('meeting_called', {
        callerId: playerId,
        callerName: player.name,
        meetingsLeft: room.meetingsLeft,
        commits: room.commits,
      });
    });

    socket.on('cast_vote', ({ roomId, voterId, targetId }) => {
      const room = getRoom(roomId);
      if (!room || room.gameState !== 'meeting') return;
      room.votes[voterId] = targetId;
      const alivePlayers = room.players.filter(p => p.isAlive);
      io.to(roomId).emit('vote_cast', { votes: room.votes, voterId, targetId });

      if (Object.keys(room.votes).length >= alivePlayers.length) {
        resolveVote(io, roomId);
      }
    });

    socket.on('skip_vote', ({ roomId, voterId }) => {
      const room = getRoom(roomId);
      if (!room) return;
      room.votes[voterId] = 'skip';
      const alivePlayers = room.players.filter(p => p.isAlive);
      io.to(roomId).emit('vote_cast', { votes: room.votes, voterId, targetId: 'skip' });
      if (Object.keys(room.votes).length >= alivePlayers.length) {
        resolveVote(io, roomId);
      }
    });

    socket.on('trigger_sabotage', ({ roomId, playerId, sabotageIndex }) => {
      const room = getRoom(roomId);
      if (!room || room.saboteurId !== playerId) return;
      if (room.sabotagesCompleted >= room.sabotagesRequired) return;

      const challenge = challenges[room.currentChallengeIndex];
      const sabotage = challenge.sabotages[sabotageIndex];
      if (!sabotage) return;

      const oldCode = room.currentCode;
      const newCode = sabotage.apply(oldCode);
      room.currentCode = newCode;
      room.sabotagesCompleted++;

      const player = room.players.find(p => p.id === playerId);
      const commit = addCommit(roomId, player.name, `${player.name} modified the code`, oldCode, newCode);

      io.to(roomId).emit('code_updated', { code: newCode, playerId });
      io.to(roomId).emit('commit_logged', commit);
      socket.emit('sabotage_applied', { sabotagesCompleted: room.sabotagesCompleted });

      if (room.sabotagesCompleted >= room.sabotagesRequired) {
        endGame(io, roomId, 'saboteur', 'Saboteur completed all 3 sabotage tasks!');
      }
    });

    socket.on('disconnect', () => {
      const result = removePlayer(socket.id);
      if (result) {
        const { player, room, roomCode } = result;
        io.to(roomCode).emit('player_left', { playerId: player.id, playerName: player.name });
      }
    });
  });
}

function resolveVote(io, roomId) {
  const room = getRoom(roomId);
  if (!room) return;

  const voteCounts = {};
  for (const targetId of Object.values(room.votes)) {
    if (targetId !== 'skip') voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  }

  let maxVotes = 0;
  let eliminated = null;
  let tie = false;

  for (const [id, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) { maxVotes = count; eliminated = id; tie = false; }
    else if (count === maxVotes) { tie = true; }
  }

  if (tie || !eliminated) {
    room.gameState = 'playing';
    io.to(roomId).emit('vote_result', { eliminated: null, tie: true, message: 'No one was eliminated (tie)' });
    startRoundTimer(io, roomId);
    return;
  }

  const eliminatedPlayer = room.players.find(p => p.id === eliminated);
  if (eliminatedPlayer) eliminatedPlayer.isAlive = false;

  const wasSaboteur = eliminatedPlayer && eliminatedPlayer.role === 'saboteur';
  io.to(roomId).emit('vote_result', {
    eliminated,
    eliminatedName: eliminatedPlayer?.name,
    wasSaboteur,
    tie: false,
  });

  if (wasSaboteur) {
    endGame(io, roomId, 'crewmates', `${eliminatedPlayer.name} was the Saboteur! Crewmates win!`);
  } else {
    room.gameState = 'playing';
    setTimeout(() => {
      startRoundTimer(io, roomId);
      io.to(roomId).emit('resume_game', { code: room.currentCode });
    }, 3000);
  }
}

function startRoundTimer(io, roomId) {
  const room = getRoom(roomId);
  if (!room) return;
  if (room.timer) clearInterval(room.timer);
  room.timerSeconds = 180;

  room.timer = setInterval(() => {
    room.timerSeconds--;
    io.to(roomId).emit('timer_tick', { secondsLeft: room.timerSeconds });

    if (room.timerSeconds <= 0) {
      clearInterval(room.timer);
      room.timer = null;
      advanceRound(io, roomId);
    }
  }, 1000);
}

function advanceRound(io, roomId) {
  const room = getRoom(roomId);
  if (!room) return;

  room.currentRound++;
  if (room.currentRound > room.maxRounds) {
    endGame(io, roomId, 'saboteur', 'Crewmates ran out of time! Saboteur wins!');
    return;
  }

  const nextChallengeIndex = Math.min(room.currentRound - 1, challenges.length - 1);
  room.currentChallengeIndex = nextChallengeIndex;
  room.currentCode = challenges[nextChallengeIndex].starterCode;

  io.to(roomId).emit('round_changed', {
    roundNumber: room.currentRound,
    challenge: safeChallenge(challenges[nextChallengeIndex]),
    code: room.currentCode,
  });

  startRoundTimer(io, roomId);
}

function endGame(io, roomId, winner, reason) {
  const room = getRoom(roomId);
  if (!room) return;
  if (room.timer) { clearInterval(room.timer); room.timer = null; }
  room.gameState = 'results';
  const saboteur = room.players.find(p => p.role === 'saboteur');
  io.to(roomId).emit('game_over', {
    winner,
    reason,
    saboteurName: saboteur?.name,
    saboteurId: saboteur?.id,
    players: room.players.map(publicPlayer),
  });
}

function safeRoom(room, playerId) {
  return {
    id: room.id,
    gameState: room.gameState,
    players: room.players.map(publicPlayer),
    currentRound: room.currentRound,
    maxRounds: room.maxRounds,
    meetingsLeft: room.meetingsLeft,
  };
}

function safeChallenge(challenge) {
  return {
    id: challenge.id,
    title: challenge.title,
    topic: challenge.topic,
    difficulty: challenge.difficulty,
    description: challenge.description,
    starterCode: challenge.starterCode,
    testCases: challenge.testCases.map(tc => ({ description: tc.description })),
  };
}

function publicPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    color: player.color,
    isAlive: player.isAlive,
    isHost: player.isHost,
  };
}

function selectWinningCategory(io, roomId) {
  const room = getRoom(roomId);
  if (!room || room.gameState !== 'category_vote') return;

  // Clear the timer
  if (room.categoryVotingTimer) clearTimeout(room.categoryVotingTimer);

  // Find category with most votes
  let maxVotes = 0;
  let selectedCategory = null;
  const categories = Object.keys(room.categoryVotes);

  for (const category of categories) {
    const votes = room.categoryVotes[category];
    if (votes > maxVotes) {
      maxVotes = votes;
      selectedCategory = category;
    }
  }

  // If no votes yet, pick random category
  if (!selectedCategory || maxVotes === 0) {
    selectedCategory = categories[Math.floor(Math.random() * categories.length)];
  }

  // Store selected category in room
  room.selectedCategory = selectedCategory;

  // Notify all players that category has been selected
  io.to(roomId).emit('category_selected', {
    category: selectedCategory,
    votes: room.categoryVotes,
    reason: maxVotes > 0 ? 'winner' : 'no_votes',
  });

  // Wait 3 seconds for animation, then assign roles and start game
  setTimeout(() => {
    proceedToRoleReveal(io, roomId);
  }, 3000);
}

function proceedToRoleReveal(io, roomId) {
  const room = getRoom(roomId);
  if (!room) return;

  // Assign roles
  const updatedRoom = assignRoles(roomId);
  updatedRoom.gameState = 'role_reveal';
  updatedRoom.currentCode = challenges[0].starterCode;
  updatedRoom.currentChallengeIndex = 0;

  updatedRoom.players.forEach(p => {
    const playerSocket = io.sockets.sockets.get(p.socketId);
    if (playerSocket) {
      playerSocket.emit('game_started', {
        role: p.role,
        challenge: safeChallenge(challenges[0]),
        players: updatedRoom.players.map(publicPlayer),
        selectedCategory: room.selectedCategory,
      });
    }
  });
}

module.exports = { setupSockets };
