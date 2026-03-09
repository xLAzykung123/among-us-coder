import { useState } from 'react';
import socket from '../socket';

export default function TestCases({ gameState, setGameState }) {
  const { roomCode, player, challenge, testResults = [], currentCode } = gameState;
  const [running, setRunning] = useState(false);

  const runTests = () => {
    if (!player || !currentCode) return;
    setRunning(true);
    socket.emit('run_tests', { roomId: roomCode, playerId: player.id, code: currentCode });
    setTimeout(() => setRunning(false), 1000);
  };

  const allPassed = testResults.length > 0 && testResults.every(r => r.passed);
  const passCount = testResults.filter(r => r.passed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Header with run button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.6rem', fontFamily: 'Orbitron', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>TEST CASES</span>
        {testResults.length > 0 && (
          <span style={{ fontSize: '0.6rem', fontFamily: 'Orbitron', color: allPassed ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {passCount}/{testResults.length}
          </span>
        )}
      </div>

      {/* Test list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {challenge?.testCases?.map((tc, i) => {
          const result = testResults[i];
          const status = !result ? 'pending' : result.passed ? 'pass' : 'fail';
          return (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              padding: '0.5rem 0.6rem',
              background: status === 'pass' ? 'rgba(57,255,20,0.06)' : status === 'fail' ? 'rgba(255,59,59,0.06)' : 'var(--bg-card)',
              borderRadius: '4px',
              border: `1px solid ${status === 'pass' ? 'rgba(57,255,20,0.2)' : status === 'fail' ? 'rgba(255,59,59,0.2)' : 'var(--border)'}`,
              transition: 'all 0.3s ease',
            }}>
              <span style={{ fontSize: '0.7rem', flexShrink: 0, marginTop: '1px' }}>
                {status === 'pass' ? '✓' : status === 'fail' ? '✗' : '○'}
              </span>
              <span style={{
                fontSize: '0.68rem',
                color: status === 'pass' ? 'var(--accent-green)' : status === 'fail' ? 'var(--accent-red)' : 'var(--text-dim)',
                lineHeight: 1.4,
                wordBreak: 'break-all',
              }}>
                {tc.description}
              </span>
            </div>
          );
        })}
        {(!challenge?.testCases || challenge.testCases.length === 0) && (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textAlign: 'center', padding: '0.75rem' }}>Loading test cases...</div>
        )}
      </div>

      <button
        onClick={runTests}
        disabled={running}
        style={{
          background: running ? 'rgba(0,255,240,0.1)' : 'rgba(0,255,240,0.15)',
          border: '1px solid var(--accent-cyan)',
          borderRadius: '4px',
          color: 'var(--accent-cyan)',
          padding: '0.6rem',
          cursor: running ? 'default' : 'pointer',
          fontSize: '0.65rem',
          fontFamily: 'Orbitron',
          letterSpacing: '0.1em',
          transition: 'all 0.2s',
          marginTop: '0.25rem',
        }}
      >
        {running ? '⟳ RUNNING...' : '▶ RUN TESTS'}
      </button>
    </div>
  );
}
