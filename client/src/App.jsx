import { useState, useEffect } from 'react';
import socket from './socket';
import Landing from './pages/Landing';
import JoinRoom from './pages/JoinRoom';
import Lobby from './pages/Lobby';
import CategoryVote from './pages/CategoryVote';
import RoleReveal from './pages/RoleReveal';
import GameScreen from './pages/GameScreen';
import Meeting from './pages/Meeting';
import Voting from './pages/Voting';
import Results from './pages/Results';
import './index.css';

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [gameState, setGameState] = useState({
    roomCode: null,
    player: null,
    room: null,
    role: null,
    challenge: null,
    players: [],
    currentCode: '',
    roundNumber: 1,
    maxRounds: 4,
    timerSeconds: 180,
    testResults: [],
    commits: [],
    chatMessages: [],
    votes: {},
    meetingsLeft: 2,
    sabotagesCompleted: 0,
    meetingCaller: null,
    gameOver: null,
    selectedCategory: null,
    categoryVotes: {},
  });

  useEffect(() => {
    socket.on('game_started', (data) => {
      setGameState(prev => ({ ...prev, role: data.role, challenge: data.challenge, players: data.players, currentCode: data.challenge?.starterCode || '', selectedCategory: data.selectedCategory }));
      setScreen('role_reveal');
    });

    socket.on('category_voting_started', ({ categories }) => {
      setGameState(prev => ({ ...prev, categoryVotes: categories.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {}) }));
      setScreen('category_vote');
    });

    socket.on('category_vote_update', ({ votes, playerVotes }) => {
      setGameState(prev => ({ ...prev, categoryVotes: votes }));
    });

    socket.on('category_selected', ({ category, reason }) => {
      setGameState(prev => ({ ...prev, selectedCategory: category }));
      // Screen transition is handled by CategoryVote component
    });

    socket.on('round_started', (data) => {
      setGameState(prev => ({ ...prev, roundNumber: data.roundNumber, challenge: data.challenge, currentCode: data.code, testResults: [] }));
      setScreen('game');
    });

    socket.on('round_changed', (data) => {
      setGameState(prev => ({ ...prev, roundNumber: data.roundNumber, challenge: data.challenge, currentCode: data.code, testResults: [] }));
    });

    socket.on('timer_tick', ({ secondsLeft }) => {
      setGameState(prev => ({ ...prev, timerSeconds: secondsLeft }));
    });

    socket.on('meeting_called', (data) => {
      setGameState(prev => ({ ...prev, meetingCaller: data, meetingsLeft: data.meetingsLeft, commits: data.commits || prev.commits }));
      setScreen('meeting');
    });

    socket.on('vote_result', (data) => {
      setGameState(prev => ({ ...prev, voteResult: data }));
    });

    socket.on('resume_game', ({ code }) => {
      setGameState(prev => ({ ...prev, currentCode: code }));
      setScreen('game');
    });

    socket.on('game_over', (data) => {
      setGameState(prev => ({ ...prev, gameOver: data }));
      setScreen('results');
    });

    socket.on('player_joined', ({ player }) => {
      setGameState(prev => ({
        ...prev,
        players: [...(prev.players || []).filter(p => p.id !== player.id), player],
        room: prev.room ? { ...prev.room, players: [...(prev.room.players || []).filter(p => p.id !== player.id), player] } : prev.room,
      }));
    });

    socket.on('player_left', ({ playerId }) => {
      setGameState(prev => ({
        ...prev,
        players: (prev.players || []).filter(p => p.id !== playerId),
      }));
    });

    return () => {
      socket.off('game_started');
      socket.off('category_voting_started');
      socket.off('category_vote_update');
      socket.off('category_selected');
      socket.off('round_started');
      socket.off('round_changed');
      socket.off('timer_tick');
      socket.off('meeting_called');
      socket.off('vote_result');
      socket.off('resume_game');
      socket.off('game_over');
      socket.off('player_joined');
      socket.off('player_left');
    };
  }, []);

  const props = { gameState, setGameState, setScreen };

  return (
    <div className="app">
      {screen === 'landing' && <Landing {...props} />}
      {screen === 'join' && <JoinRoom {...props} />}
      {screen === 'lobby' && <Lobby {...props} />}
      {screen === 'category_vote' && <CategoryVote {...props} />}
      {screen === 'role_reveal' && <RoleReveal {...props} />}
      {screen === 'game' && <GameScreen {...props} />}
      {screen === 'meeting' && <Meeting {...props} />}
      {screen === 'voting' && <Voting {...props} />}
      {screen === 'results' && <Results {...props} />}
    </div>
  );
}
