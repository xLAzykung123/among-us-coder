import { useEffect, useState } from 'react';

export default function Meeting({ gameState, setScreen }) {
  const { meetingCaller, commits = [] } = gameState;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); setScreen('voting'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #1a0000 0%, #050709 70%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Scanlines */}
      <div style={{ position: 'fixed', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,59,59,0.02) 3px, rgba(255,59,59,0.02) 6px)', pointerEvents: 'none' }} />

      <div className="fade-in" style={{ textAlign: 'center', zIndex: 1, padding: '2rem', maxWidth: '600px', width: '100%' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'pulse-red 0.5s infinite' }}>🚨</div>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--accent-red)', letterSpacing: '0.1em', marginBottom: '0.5rem', textShadow: 'var(--glow-red)' }}>
          EMERGENCY MEETING
        </h1>
        <p style={{ color: 'rgba(255,100,100,0.8)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
          Called by: <strong style={{ color: 'var(--accent-red)' }}>{meetingCaller?.callerName || 'Unknown'}</strong>
        </p>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginBottom: '2rem' }}>
          Proceeding to vote in {countdown}...
        </p>

        {/* Recent commits as evidence */}
        {commits.length > 0 && (
          <div style={{ background: 'rgba(255,59,59,0.05)', border: '1px solid rgba(255,59,59,0.2)', borderRadius: '8px', padding: '1rem', textAlign: 'left', maxHeight: '240px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.6rem', fontFamily: 'Orbitron', color: 'var(--accent-red)', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
              📋 EVIDENCE — COMMIT HISTORY
            </div>
            {commits.slice(0, 8).map(commit => (
              <div key={commit.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,59,59,0.1)', fontSize: '0.72rem' }}>
                <div>
                  <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>{commit.playerName}</span>
                  <span style={{ color: 'var(--text-dim)', marginLeft: '0.5rem' }}>{commit.summary}</span>
                </div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.6rem', flexShrink: 0 }}>{commit.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
