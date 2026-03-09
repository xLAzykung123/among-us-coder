import { useState, useEffect } from 'react';
import socket from '../socket';

export default function JoinRoom({ gameState, setGameState, setScreen }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    socket.on('room_joined', ({ player, room }) => {
      setGameState(prev => ({ ...prev, roomCode: room.id, player, room, players: room.players }));
      setScreen('lobby');
      setJoining(false);
    });
    socket.on('join_error', ({ message }) => {
      setError(message);
      setJoining(false);
    });
    return () => { socket.off('room_joined'); socket.off('join_error'); };
  }, []);

  const handleJoin = () => {
    if (!name.trim() || !code.trim()) { setError('Enter your codename and mission code'); return; }
    setError('');
    setJoining(true);
    socket.emit('join_room', { playerName: name.trim(), roomCode: code.trim().toUpperCase() });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="stars-bg" />
      <div className="fade-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <button onClick={() => setScreen('landing')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Orbitron', letterSpacing: '0.1em', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ← BACK
        </button>

        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>JOIN MISSION</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '2rem' }}>Enter an invite code to join a mission in progress</p>

        <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.65rem', fontFamily: 'Orbitron', color: 'var(--accent-cyan)', letterSpacing: '0.2em', display: 'block', marginBottom: '0.5rem' }}>CODENAME</label>
            <input className="input" placeholder="Your codename..." value={name} onChange={e => setName(e.target.value)} maxLength={16} autoFocus />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', fontFamily: 'Orbitron', color: 'var(--accent-cyan)', letterSpacing: '0.2em', display: 'block', marginBottom: '0.5rem' }}>MISSION CODE</label>
            <input
              className="input"
              placeholder="e.g. ABC123"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              maxLength={6}
              style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.2rem', textTransform: 'uppercase' }}
            />
          </div>
          {error && <div style={{ color: 'var(--accent-red)', fontSize: '0.75rem', padding: '0.5rem', background: 'rgba(255,59,59,0.1)', borderRadius: '4px', border: '1px solid rgba(255,59,59,0.3)' }}>⚠ {error}</div>}
          <button className="btn btn-primary" onClick={handleJoin} disabled={joining || !name.trim() || !code.trim()} style={{ width: '100%', padding: '1rem' }}>
            {joining ? 'CONNECTING...' : 'JOIN MISSION'}
          </button>
        </div>
      </div>
    </div>
  );
}
