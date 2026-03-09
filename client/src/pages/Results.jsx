export default function Results({ gameState, setGameState, setScreen }) {
  const { gameOver, players = [] } = gameState;
  const crewmatesWin = gameOver?.winner === 'crewmates';

  const handlePlayAgain = () => {
    setGameState(prev => ({
      ...prev,
      role: null, challenge: null, currentCode: '',
      roundNumber: 1, timerSeconds: 180,
      testResults: [], commits: [], votes: {},
      meetingsLeft: 2, sabotagesCompleted: 0,
      meetingCaller: null, gameOver: null,
    }));
    setScreen('lobby');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: crewmatesWin
        ? 'radial-gradient(ellipse at center, #051a05 0%, #050709 70%)'
        : 'radial-gradient(ellipse at center, #1a0505 0%, #050709 70%)',
      padding: '2rem',
    }}>
      <div className="fade-in" style={{ textAlign: 'center', maxWidth: '560px', width: '100%' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem', filter: `drop-shadow(0 0 30px ${crewmatesWin ? 'var(--accent-green)' : 'var(--accent-red)'})` }}>
          {crewmatesWin ? '🎉' : '💀'}
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          color: crewmatesWin ? 'var(--accent-green)' : 'var(--accent-red)',
          letterSpacing: '0.05em',
          marginBottom: '0.5rem',
          textShadow: crewmatesWin ? 'var(--glow-green)' : 'var(--glow-red)',
        }}>
          {crewmatesWin ? 'CREWMATES WIN' : 'SABOTEUR WINS'}
        </h1>

        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          {gameOver?.reason}
        </p>

        {/* Saboteur reveal */}
        <div style={{
          padding: '1rem 1.5rem',
          background: 'rgba(255,59,59,0.08)',
          border: '1px solid rgba(255,59,59,0.25)',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'inline-block',
        }}>
          <div style={{ fontSize: '0.6rem', fontFamily: 'Orbitron', color: 'var(--text-dim)', letterSpacing: '0.2em', marginBottom: '0.35rem' }}>THE SABOTEUR WAS</div>
          <div style={{ fontSize: '1.5rem', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--accent-red)' }}>
            🔴 {gameOver?.saboteurName || '???'}
          </div>
        </div>

        {/* Players */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '2rem', textAlign: 'left' }}>
          {players.map(p => {
            const isSaboteur = p.id === gameOver?.saboteurId;
            return (
              <div key={p.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                background: isSaboteur ? 'rgba(255,59,59,0.1)' : 'var(--bg-panel)',
                border: `1px solid ${isSaboteur ? 'rgba(255,59,59,0.3)' : 'var(--border)'}`,
                borderRadius: '6px',
              }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${p.color}30`, border: `2px solid ${p.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.color, fontWeight: 700, fontSize: '0.8rem' }}>
                  {p.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: p.color }}>{p.name}</div>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'Orbitron', color: isSaboteur ? 'var(--accent-red)' : 'var(--text-dim)' }}>
                    {isSaboteur ? '🔴 SABOTEUR' : '👨‍🚀 CREWMATE'}
                  </div>
                </div>
                {!p.isAlive && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-dim)' }}>☠ ejected</span>}
              </div>
            );
          })}
        </div>

        <button className="btn btn-primary" onClick={handlePlayAgain} style={{ padding: '1rem 3rem', fontSize: '0.85rem' }}>
          🔄 PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
