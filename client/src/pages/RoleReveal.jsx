import { useEffect, useState } from 'react';
import socket from '../socket';

export default function RoleReveal({ gameState, setGameState, setScreen }) {
  const { role, player } = gameState;
  const [phase, setPhase] = useState('reveal'); // reveal -> ready
  const isSaboteur = role === 'saboteur';

  useEffect(() => {
    const timer = setTimeout(() => setPhase('ready'), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleReady = () => {
    socket.emit('ready_to_play', { roomId: gameState.roomCode });
    setScreen('game');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: phase === 'reveal'
        ? isSaboteur ? 'radial-gradient(ellipse at center, #1a0505 0%, #050709 70%)' : 'radial-gradient(ellipse at center, #050f1a 0%, #050709 70%)'
        : 'var(--bg-deep)',
      transition: 'background 1s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Scan line effect */}
      {phase === 'reveal' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(${isSaboteur ? '255,59,59' : '0,255,240'},0.02) 2px, rgba(${isSaboteur ? '255,59,59' : '0,255,240'},0.02) 4px)`,
          pointerEvents: 'none',
        }} />
      )}

      <div className="fade-in" style={{ textAlign: 'center', zIndex: 1, padding: '2rem', maxWidth: '480px', width: '100%' }}>
        {phase === 'reveal' ? (
          <>
            <div style={{
              fontSize: '6rem',
              marginBottom: '1rem',
              filter: `drop-shadow(0 0 30px ${isSaboteur ? 'var(--accent-red)' : 'var(--accent-cyan)'})`,
              animation: 'glitch 0.5s ease 0.5s',
            }}>
              {isSaboteur ? '🔴' : '👨‍🚀'}
            </div>
            <div style={{
              fontSize: '0.7rem',
              fontFamily: 'Orbitron',
              letterSpacing: '0.5em',
              color: isSaboteur ? 'var(--accent-red)' : 'var(--accent-cyan)',
              marginBottom: '0.5rem',
            }}>
              YOU ARE
            </div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 900,
              color: isSaboteur ? 'var(--accent-red)' : 'var(--accent-cyan)',
              letterSpacing: '0.1em',
              textShadow: `0 0 40px ${isSaboteur ? 'var(--accent-red)' : 'var(--accent-cyan)'}`,
            }}>
              {isSaboteur ? 'SABOTEUR' : 'CREWMATE'}
            </h1>
          </>
        ) : (
          <div className="fade-in">
            <div style={{
              fontSize: '4rem',
              marginBottom: '1.5rem',
              filter: `drop-shadow(0 0 20px ${isSaboteur ? 'var(--accent-red)' : 'var(--accent-cyan)'})`,
            }}>
              {isSaboteur ? '🔴' : '👨‍🚀'}
            </div>

            <div style={{
              padding: '1.5rem',
              background: `rgba(${isSaboteur ? '255,59,59' : '0,255,240'},0.05)`,
              border: `1px solid ${isSaboteur ? 'var(--accent-red)' : 'var(--accent-cyan)'}`,
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}>
              <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: isSaboteur ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
                {isSaboteur ? '⚠ YOUR MISSION' : '✓ YOUR MISSION'}
              </h2>
              {isSaboteur ? (
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem', lineHeight: 1.6 }}>
                    Complete 3 sabotage tasks to corrupt the codebase. Be subtle. Don't get caught.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['Rename a variable to break logic', 'Flip a comparison operator', 'Corrupt a core function'].map((task, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'rgba(255,59,59,0.08)', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--accent-red)', fontSize: '0.75rem', fontFamily: 'Orbitron' }}>0{i+1}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                    Fix all coding challenges and pass the test cases before Round 4 ends. Work together with your crew. Watch for suspicious edits in the commit history.
                  </p>
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '1.5rem', fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
              ⚠ DO NOT REVEAL YOUR ROLE TO OTHER PLAYERS
            </p>

            <button
              className="btn"
              onClick={handleReady}
              style={{
                padding: '1rem 3rem',
                fontSize: '0.85rem',
                background: isSaboteur ? 'var(--accent-red)' : 'var(--accent-cyan)',
                color: 'var(--bg-deep)',
                fontWeight: 700,
                boxShadow: isSaboteur ? 'var(--glow-red)' : 'var(--glow-cyan)',
              }}
            >
              {isSaboteur ? '⚡ BEGIN SABOTAGE' : '🚀 BEGIN MISSION'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
