import { useState, useEffect } from 'react';
import socket from '../socket';

export default function Voting({ gameState, setGameState, setScreen }) {
  const { roomCode, player, players = [] } = gameState;
  const [votes, setVotes] = useState({});
  const [myVote, setMyVote] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [result, setResult] = useState(null);
  const alivePlayers = players.filter(p => p.isAlive);

  useEffect(() => {
    socket.on('vote_cast', ({ votes: newVotes }) => setVotes(newVotes));
    socket.on('vote_result', (data) => {
      setResult(data);
      setTimeout(() => {
        if (data.wasSaboteur || (gameState.gameOver)) {
          setScreen('results');
        } else {
          setScreen('game');
        }
      }, 4000);
    });

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!myVote) socket.emit('skip_vote', { roomId: roomCode, voterId: player?.id });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      socket.off('vote_cast');
      socket.off('vote_result');
      clearInterval(timer);
    };
  }, []);

  const castVote = (targetId) => {
    if (myVote || !player?.isAlive) return;
    setMyVote(targetId);
    socket.emit('cast_vote', { roomId: roomCode, voterId: player?.id, targetId });
  };

  const getVoteCount = (playerId) => Object.values(votes).filter(v => v === playerId).length;
  const totalVotes = Object.keys(votes).length;

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at center, #0a0514 0%, #050709 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--accent-cyan)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>VOTE TO EJECT</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Who do you think is the saboteur?</p>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: timeLeft <= 10 ? 'var(--accent-red)' : 'var(--accent-cyan)', animation: 'pulse-red 1s infinite' }} />
            <span style={{ fontFamily: 'Orbitron', fontSize: '1rem', color: timeLeft <= 10 ? 'var(--accent-red)' : 'var(--text-primary)', fontWeight: 700 }}>{timeLeft}s</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>— {totalVotes}/{alivePlayers.length} voted</span>
          </div>
        </div>

        {result ? (
          <div className="fade-in" style={{ textAlign: 'center', padding: '2rem', background: result.wasSaboteur ? 'rgba(57,255,20,0.1)' : 'rgba(255,59,59,0.1)', border: `1px solid ${result.wasSaboteur ? 'var(--accent-green)' : 'var(--accent-red)'}`, borderRadius: '12px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{result.tie ? '🤝' : result.wasSaboteur ? '🎉' : '😢'}</div>
            <h2 style={{ fontSize: '1.2rem', color: result.wasSaboteur ? 'var(--accent-green)' : 'var(--accent-red)', marginBottom: '0.5rem' }}>
              {result.tie ? 'No one was ejected (tie)' : `${result.eliminatedName} was ejected`}
            </h2>
            {!result.tie && (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                {result.wasSaboteur ? '✓ They were the Saboteur! Crewmates win!' : '✗ They were NOT the Saboteur. Game continues...'}
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {alivePlayers.map(p => {
              const voteCount = getVoteCount(p.id);
              const isMe = p.id === player?.id;
              const iVoted = myVote === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => !isMe && castVote(p.id)}
                  disabled={!!myVote || isMe}
                  style={{
                    background: iVoted ? `${p.color}20` : 'var(--bg-panel)',
                    border: `2px solid ${iVoted ? p.color : myVote ? 'var(--border)' : p.color + '60'}`,
                    borderRadius: '8px',
                    padding: '1rem',
                    cursor: myVote || isMe ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    opacity: myVote && !iVoted ? 0.5 : 1,
                    transform: iVoted ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${p.color}30`, border: `2px solid ${p.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.color, fontWeight: 700, fontSize: '1rem' }}>
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: p.color, fontWeight: 600 }}>{p.name}</div>
                      {isMe && <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'Orbitron' }}>YOU</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {[...Array(voteCount)].map((_, i) => (
                      <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-red)', boxShadow: 'var(--glow-red)' }} title="Vote" />
                    ))}
                    {voteCount === 0 && <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>No votes</span>}
                  </div>
                </button>
              );
            })}

            {/* Skip vote */}
            {!myVote && (
              <button
                onClick={() => { setMyVote('skip'); socket.emit('skip_vote', { roomId: roomCode, voterId: player?.id }); }}
                style={{ gridColumn: '1 / -1', background: 'transparent', border: '1px dashed var(--border)', borderRadius: '8px', padding: '0.75rem', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
              >
                SKIP VOTE
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
