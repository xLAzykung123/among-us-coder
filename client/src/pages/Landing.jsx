import { useEffect, useState } from 'react';
import socket from '../socket';

export default function Landing({ gameState, setGameState, setScreen }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    socket.on('room_created', ({ roomCode, player, room }) => {
      setGameState(prev => ({ ...prev, roomCode, player, room, players: room.players }));
      setScreen('lobby');
      setCreating(false);
    });
    return () => socket.off('room_created');
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return;
    setCreating(true);
    socket.emit('create_room', { playerName: name.trim() });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="stars-bg" />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'fixed',
          width: '3px', height: '3px',
          borderRadius: '50%',
          background: i % 2 === 0 ? 'var(--accent-cyan)' : '#aa44ff',
          left: `${15 + i * 15}%`,
          top: `${20 + (i % 3) * 25}%`,
          boxShadow: `0 0 10px currentColor`,
          animation: `fadeIn ${1 + i * 0.3}s ease`,
          opacity: 0.6,
        }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
        {/* Logo */}
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.4em', color: 'var(--text-dim)', fontFamily: 'Orbitron', marginBottom: '0.5rem' }}>
            SPACE STATION — SECTOR 7
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 4rem)',
            fontWeight: 900,
            letterSpacing: '0.05em',
            background: 'linear-gradient(135deg, var(--accent-cyan), #fff 50%, #aa44ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            marginBottom: '0.25rem',
          }}>CODEUS</h1>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: 'var(--accent-red)', fontFamily: 'Orbitron' }}>
            ⚠ ONE OF US IS NOT DEBUGGING ⚠
          </div>
        </div>

        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.6, margin: '1.5rem 0', padding: '1rem', background: 'rgba(13,18,36,0.8)', borderRadius: '6px', border: '1px solid var(--border)' }}>
          Collaborate on code missions. Find the saboteur before they corrupt the codebase.
        </p>

        {!showCreate ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ fontSize: '0.8rem', padding: '1rem 2rem' }}>
              ⬡ CREATE MISSION
            </button>
            <button className="btn btn-ghost" onClick={() => setScreen('join')} style={{ fontSize: '0.8rem', padding: '1rem 2rem' }}>
              ⬢ JOIN MISSION
            </button>
          </div>
        ) : (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--accent-cyan)', fontFamily: 'Orbitron', marginBottom: '0.25rem' }}>
              ENTER CODENAME
            </div>
            <input
              className="input"
              placeholder="Your codename..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              maxLength={16}
              style={{ textAlign: 'center', fontSize: '1rem', letterSpacing: '0.05em' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={handleCreate} disabled={creating || !name.trim()} style={{ flex: 1 }}>
                {creating ? 'LAUNCHING...' : 'LAUNCH MISSION'}
              </button>
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>✕</button>
            </div>
          </div>
        )}

        {/* How to play */}
        <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'left' }}>
          {[
            { icon: '👨‍🚀', label: 'CREWMATES', desc: 'Fix bugs & complete code before time runs out' },
            { icon: '🔴', label: 'SABOTEUR', desc: 'Secretly break code without getting caught' },
            { icon: '🔍', label: 'EVIDENCE', desc: 'Inspect commit history to find the impostor' },
            { icon: '🚨', label: 'MEETING', desc: 'Call emergency vote to eliminate suspects' },
          ].map(item => (
            <div key={item.label} style={{ padding: '0.75rem', background: 'rgba(13,18,36,0.8)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{item.icon}</div>
              <div style={{ fontSize: '0.6rem', fontFamily: 'Orbitron', color: 'var(--accent-cyan)', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
