import { useEffect } from 'react';
import socket from '../socket';

export default function Lobby({ gameState, setGameState, setScreen }) {
  const { roomCode, player, room } = gameState;
  const players = room?.players || [];
  const isHost = player?.isHost;

  const handleStart = () => {
    socket.emit('start_game', { roomId: roomCode });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="stars-bg" />
      <div className="fade-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '560px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.65rem', fontFamily: 'Orbitron', color: 'var(--text-dim)', letterSpacing: '0.3em', marginBottom: '0.5rem' }}>MISSION LOBBY</div>
          <h1 style={{ fontSize: '1.8rem', letterSpacing: '0.05em', marginBottom: '1rem' }}>WAITING FOR CREW</h1>

          {/* Room code */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-panel)', border: '1px solid var(--accent-cyan)', borderRadius: '8px', padding: '0.75rem 1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.6rem', fontFamily: 'Orbitron', color: 'var(--text-dim)', letterSpacing: '0.2em' }}>INVITE CODE</div>
              <div style={{ fontSize: '2rem', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.3em' }}>{roomCode}</div>
            </div>
            <button onClick={copyCode} style={{ background: 'rgba(0,255,240,0.1)', border: '1px solid rgba(0,255,240,0.3)', borderRadius: '4px', padding: '0.4rem 0.8rem', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'Orbitron' }}>
              COPY
            </button>
          </div>
        </div>

        <div className="panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.65rem', fontFamily: 'Orbitron', color: 'var(--text-dim)', letterSpacing: '0.2em' }}>CREW MANIFEST</span>
            <span style={{ fontSize: '0.65rem', fontFamily: 'Orbitron', color: 'var(--accent-cyan)' }}>{players.length}/8</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {players.map(p => (
              <div key={p.id} className="slide-in" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '6px', border: `1px solid ${p.id === player?.id ? p.color : 'var(--border)'}` }}>
                <div className="astronaut" style={{ color: p.color, borderColor: p.color, background: `${p.color}20`, fontSize: '0.9rem' }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: p.id === player?.id ? p.color : 'var(--text-primary)' }}>
                    {p.name}
                    {p.id === player?.id && <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginLeft: '0.4rem' }}>(you)</span>}
                  </div>
                  {p.isHost && <div style={{ fontSize: '0.6rem', fontFamily: 'Orbitron', color: 'var(--accent-yellow)', letterSpacing: '0.1em' }}>HOST</div>}
                </div>
              </div>
            ))}
            {/* Empty slots */}
            {[...Array(Math.max(0, 2 - players.length))].map((_, i) => (
              <div key={`empty-${i}`} style={{ padding: '0.75rem', background: 'rgba(13,18,36,0.5)', borderRadius: '6px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px dashed var(--border)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Waiting...</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          {isHost ? (
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                {players.length < 2 ? 'Need at least 2 players to start' : 'Ready to launch the mission?'}
              </p>
              <button className="btn btn-primary" onClick={handleStart} disabled={players.length < 2} style={{ padding: '1rem 3rem', fontSize: '0.9rem' }}>
                🚀 LAUNCH MISSION
              </button>
            </div>
          ) : (
            <div style={{ padding: '1rem', background: 'rgba(13,18,36,0.8)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block', marginRight: '0.5rem', animation: 'pulse-red 1.5s infinite' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>WAITING FOR HOST TO LAUNCH...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
