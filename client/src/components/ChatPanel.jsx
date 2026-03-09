import { useState, useEffect, useRef } from 'react';
import socket from '../socket';

export default function ChatPanel({ gameState }) {
  const { roomCode, player, chatMessages = [] } = gameState;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on('message_received', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => socket.off('message_received');
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !player) return;
    socket.emit('send_message', { roomId: roomCode, playerId: player.id, message: input.trim() });
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: 'var(--glow-green)' }} />
        <span style={{ fontSize: '0.6rem', fontFamily: 'Orbitron', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>COMMS CHANNEL</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.7rem', marginTop: '2rem' }}>
            No messages yet.<br/>Discuss your findings...
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className="slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: msg.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: msg.color }}>{msg.playerName}</span>
              <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>{msg.timestamp}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', paddingLeft: '1.1rem', lineHeight: 1.4 }}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Say something..."
          maxLength={200}
          style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', padding: '0.5rem 0.75rem', fontSize: '0.78rem', outline: 'none', fontFamily: 'JetBrains Mono, monospace' }}
        />
        <button onClick={sendMessage} style={{ background: 'var(--accent-cyan)', border: 'none', borderRadius: '4px', padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--bg-deep)', fontWeight: 700 }}>
          ▶
        </button>
      </div>
    </div>
  );
}
