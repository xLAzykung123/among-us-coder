import { useState, useEffect } from 'react';
import socket from '../socket';

const SABOTAGES = [
  { index: 0, label: 'Variable Rename', description: 'Rename a key variable to break the function logic' },
  { index: 1, label: 'Condition Flip', description: 'Flip a comparison operator to invert logic' },
  { index: 2, label: 'Function Corrupt', description: 'Corrupt a core calculation to produce wrong results' },
];

export default function SaboteurPanel({ gameState }) {
  const { roomCode, player } = gameState;
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [sabotagesCompleted, setSabotagesCompleted] = useState(0);

  useEffect(() => {
    socket.on('sabotage_applied', ({ sabotagesCompleted }) => {
      setSabotagesCompleted(sabotagesCompleted);
    });
    return () => socket.off('sabotage_applied');
  }, []);

  const triggerSabotage = (index) => {
    if (completed.includes(index)) return;
    socket.emit('trigger_sabotage', { roomId: roomCode, playerId: player.id, sabotageIndex: index });
    setCompleted(prev => [...prev, index]);
  };

  if (gameState.role !== 'saboteur') return null;

  return (
    <>
      {/* Toggle tab */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          right: open ? '260px' : '0',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'var(--accent-red)',
          border: 'none',
          borderRadius: '6px 0 0 6px',
          padding: '0.75rem 0.4rem',
          cursor: 'pointer',
          color: 'white',
          fontSize: '0.6rem',
          fontFamily: 'Orbitron',
          letterSpacing: '0.1em',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          zIndex: 100,
          boxShadow: 'var(--glow-red)',
          transition: 'right 0.3s ease',
        }}
      >
        {open ? '▶ HIDE' : '◀ SABOTAGE'}
      </button>

      {/* Panel */}
      <div style={{
        position: 'fixed',
        right: open ? '0' : '-260px',
        top: 0,
        bottom: 0,
        width: '260px',
        background: 'linear-gradient(180deg, #1a0505 0%, #0a0209 100%)',
        border: '1px solid rgba(255,59,59,0.3)',
        borderRight: 'none',
        zIndex: 99,
        transition: 'right 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,59,59,0.2)' }}>
          <div style={{ fontSize: '0.6rem', fontFamily: 'Orbitron', color: 'var(--accent-red)', letterSpacing: '0.2em', marginBottom: '0.25rem' }}>
            ⚠ SABOTEUR CONSOLE
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,59,59,0.6)' }}>
            {sabotagesCompleted}/3 sabotages complete
          </div>
          {/* Progress */}
          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i < sabotagesCompleted ? 'var(--accent-red)' : 'rgba(255,59,59,0.2)', transition: 'background 0.3s' }} />
            ))}
          </div>
        </div>

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,100,100,0.7)', lineHeight: 1.5 }}>
            Execute sabotages carefully. Your edits appear in commit history — be subtle.
          </p>

          {SABOTAGES.map(s => {
            const done = completed.includes(s.index);
            return (
              <div key={s.index} style={{
                padding: '0.75rem',
                background: done ? 'rgba(255,59,59,0.05)' : 'rgba(255,59,59,0.1)',
                border: `1px solid ${done ? 'rgba(255,59,59,0.15)' : 'rgba(255,59,59,0.3)'}`,
                borderRadius: '6px',
                opacity: done ? 0.5 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'Orbitron', color: done ? 'var(--text-dim)' : 'var(--accent-red)', textDecoration: done ? 'line-through' : 'none' }}>
                    {done ? '✓ ' : ''}{s.label}
                  </span>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>0{s.index + 1}</span>
                </div>
                <p style={{ fontSize: '0.63rem', color: 'rgba(255,100,100,0.6)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                  {s.description}
                </p>
                <button
                  className="btn btn-sabotage"
                  onClick={() => triggerSabotage(s.index)}
                  disabled={done}
                  style={{ width: '100%', padding: '0.4rem' }}
                >
                  {done ? 'EXECUTED' : '⚡ EXECUTE'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
