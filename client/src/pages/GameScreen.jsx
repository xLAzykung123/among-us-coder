import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import socket from '../socket';
import ChatPanel from '../components/ChatPanel';
import TestCases from '../components/TestCases';
import CommitHistory from '../components/CommitHistory';
import SaboteurPanel from '../components/SaboteurPanel';

export default function GameScreen({ gameState, setGameState, setScreen }) {
  const { roomCode, player, challenge, roundNumber, maxRounds, timerSeconds, players = [] } = gameState;
  const [code, setCode] = useState(gameState.currentCode || '');
  const [remoteCursors, setRemoteCursors] = useState({});
  const [testResults, setTestResults] = useState([]);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);
  const isReceivingRef = useRef(false);
  const debounceRef = useRef(null);

  // Sync code from gameState
  useEffect(() => {
    if (gameState.currentCode && gameState.currentCode !== code) {
      setCode(gameState.currentCode);
    }
  }, [gameState.currentCode]);

  useEffect(() => {
    // Receive code from other players
    socket.on('code_updated', ({ code: newCode, playerId }) => {
      if (playerId !== player?.id) {
        isReceivingRef.current = true;
        setCode(newCode);
        setGameState(prev => ({ ...prev, currentCode: newCode }));
        setTimeout(() => { isReceivingRef.current = false; }, 100);
      }
    });

    // Receive cursors
    socket.on('cursor_updated', ({ playerId, line, column, color, name }) => {
      if (playerId === player?.id) return;
      setRemoteCursors(prev => ({ ...prev, [playerId]: { line, column, color, name } }));
    });

    // Test results
    socket.on('test_results', ({ results, allPassed }) => {
      setTestResults(results);
      setGameState(prev => ({ ...prev, testResults: results }));
    });

    // Round change
    socket.on('round_changed', ({ code: newCode, challenge: newChallenge, roundNumber }) => {
      setCode(newCode);
      setTestResults([]);
      setGameState(prev => ({ ...prev, currentCode: newCode, challenge: newChallenge, roundNumber, testResults: [] }));
    });

    return () => {
      socket.off('code_updated');
      socket.off('cursor_updated');
      socket.off('test_results');
      socket.off('round_changed');
    };
  }, [player?.id]);

  // Render remote cursors using Monaco decorations
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const newDecorations = Object.entries(remoteCursors).map(([pid, cursor]) => ({
      range: new monaco.Range(cursor.line, cursor.column, cursor.line, cursor.column + 1),
      options: {
        className: `remote-cursor-${pid}`,
        beforeContentClassName: `remote-cursor-before-${pid}`,
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        zIndex: 10,
      },
    }));

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);

    // Inject styles for each cursor
    Object.entries(remoteCursors).forEach(([pid, cursor]) => {
      const styleId = `cursor-style-${pid}`;
      let styleEl = document.getElementById(styleId);
      if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = styleId; document.head.appendChild(styleEl); }
      styleEl.innerHTML = `
        .remote-cursor-${pid} { border-left: 2px solid ${cursor.color} !important; }
        .remote-cursor-before-${pid}::before {
          content: '${cursor.name}';
          background: ${cursor.color};
          color: #000;
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          padding: 1px 4px;
          border-radius: 2px;
          position: absolute;
          top: -18px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 100;
        }
      `;
    });
  }, [remoteCursors]);

  const handleEditorChange = useCallback((value) => {
    if (isReceivingRef.current) return;
    setCode(value);
    setGameState(prev => ({ ...prev, currentCode: value }));

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      socket.emit('code_change', { roomId: roomCode, code: value, playerId: player?.id });
    }, 50);
  }, [roomCode, player?.id]);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track cursor movement
    editor.onDidChangeCursorPosition((e) => {
      socket.emit('cursor_move', {
        roomId: roomCode,
        playerId: player?.id,
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Ctrl+S to commit
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      socket.emit('commit_code', { roomId: roomCode, playerId: player?.id, code: editor.getValue() });
    });
  };

  const handleCallMeeting = () => {
    if (gameState.meetingsLeft <= 0) return;
    socket.emit('call_meeting', { roomId: roomCode, playerId: player?.id });
  };

  const alivePlayers = players.filter(p => p.isAlive);
  const timerWarning = timerSeconds <= 30;
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  const timerStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)', overflow: 'hidden' }}>
      {/* TOP BAR */}
      <div style={{
        height: '52px',
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
        gap: '1rem',
        flexShrink: 0,
      }}>
        {/* Round */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.6rem', fontFamily: 'Orbitron', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>ROUND</span>
          <span style={{ fontSize: '0.9rem', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--accent-cyan)' }}>{roundNumber}/{maxRounds}</span>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

        {/* Topic */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'Orbitron', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
            {challenge?.topic || 'Loading...'}
          </span>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

        {/* Players alive */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {alivePlayers.slice(0, 6).map(p => (
            <div key={p.id} title={p.name} style={{ width: '20px', height: '20px', borderRadius: '50%', background: p.color, border: `2px solid ${p.id === player?.id ? 'white' : 'transparent'}`, fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700 }}>
              {p.name.charAt(0)}
            </div>
          ))}
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'Orbitron', marginLeft: '0.25rem' }}>{alivePlayers.length} alive</span>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.6rem', fontFamily: 'Orbitron', color: 'var(--text-dim)' }}>⏱</span>
          <span style={{
            fontSize: '1rem',
            fontFamily: 'Orbitron',
            fontWeight: 700,
            color: timerWarning ? 'var(--accent-red)' : 'var(--text-primary)',
            animation: timerWarning ? 'pulse-red 1s infinite' : 'none',
            minWidth: '50px',
          }}>
            {timerStr}
          </span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT PANEL */}
        <div style={{
          width: '240px',
          flexShrink: 0,
          background: 'var(--bg-panel)',
          borderRight: '1px solid var(--border)',
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          <TestCases gameState={{ ...gameState, testResults, currentCode: code }} setGameState={setGameState} />
          <div style={{ width: '100%', height: '1px', background: 'var(--border)' }} />
          <CommitHistory gameState={gameState} />
        </div>

        {/* CENTER - EDITOR */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Challenge description */}
          <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className={`tag tag-${challenge?.difficulty?.toLowerCase() || 'easy'}`}>{challenge?.difficulty}</span>
              <span style={{ fontSize: '0.8rem', fontFamily: 'Orbitron', fontWeight: 600 }}>{challenge?.title}</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.3rem', lineHeight: 1.5 }}>
              {challenge?.description}
            </p>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              💡 Press <kbd style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '2px', padding: '0 3px', fontSize: '0.6rem' }}>Ctrl+S</kbd> to commit your changes
            </p>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Editor
              height="100%"
              language="javascript"
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 2,
                automaticLayout: true,
                padding: { top: 12 },
              }}
            />
          </div>

          {/* Bottom bar */}
          <div style={{
            padding: '0.6rem 1rem',
            background: 'var(--bg-panel)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexShrink: 0,
          }}>
            <button
              onClick={handleCallMeeting}
              disabled={gameState.meetingsLeft <= 0}
              className="btn btn-danger"
              style={{ fontSize: '0.7rem', padding: '0.5rem 1rem', opacity: gameState.meetingsLeft <= 0 ? 0.4 : 1 }}
            >
              🚨 EMERGENCY MEETING ({gameState.meetingsLeft} left)
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(maxRounds)].map((_, i) => (
                  <div key={i} style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    background: i < roundNumber ? 'var(--accent-cyan)' : 'var(--border)',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - CHAT */}
        <div style={{
          width: '240px',
          flexShrink: 0,
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <ChatPanel gameState={gameState} />
        </div>
      </div>

      {/* Saboteur sliding panel */}
      <SaboteurPanel gameState={gameState} />
    </div>
  );
}
