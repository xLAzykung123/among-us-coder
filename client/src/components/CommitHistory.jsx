import { useState, useEffect } from 'react';
import socket from '../socket';

export default function CommitHistory({ gameState }) {
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);

  useEffect(() => {
    socket.on('commit_logged', (commit) => {
      setCommits(prev => [commit, ...prev].slice(0, 20));
    });
    return () => socket.off('commit_logged');
  }, []);

  return (
    <div>
      <div style={{ fontSize: '0.6rem', fontFamily: 'Orbitron', letterSpacing: '0.2em', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
        COMMIT HISTORY
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '180px', overflowY: 'auto' }}>
        {commits.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', textAlign: 'center', padding: '0.75rem' }}>
            No commits yet...
          </div>
        ) : (
          commits.map(commit => (
            <div
              key={commit.id}
              onClick={() => setSelectedCommit(selectedCommit?.id === commit.id ? null : commit)}
              style={{
                padding: '0.5rem 0.6rem',
                background: selectedCommit?.id === commit.id ? 'rgba(0,255,240,0.08)' : 'var(--bg-card)',
                borderRadius: '4px',
                border: `1px solid ${selectedCommit?.id === commit.id ? 'rgba(0,255,240,0.3)' : 'var(--border)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{commit.playerName}</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>{commit.timestamp}</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{commit.summary}</div>

              {/* Diff view */}
              {selectedCommit?.id === commit.id && commit.diff && commit.diff.length > 0 && (
                <div style={{ marginTop: '0.5rem', padding: '0.4rem', background: 'var(--bg-deep)', borderRadius: '3px', fontSize: '0.6rem', fontFamily: 'monospace' }}>
                  {commit.diff.map((d, i) => (
                    <div key={i} style={{ color: d.type === 'added' ? 'var(--accent-green)' : 'var(--accent-red)', lineHeight: 1.5 }}>
                      {d.type === 'added' ? '+' : '-'} {d.line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
