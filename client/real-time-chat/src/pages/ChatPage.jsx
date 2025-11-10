import React, { useMemo, useState } from 'react';
import useSocket from '../hooks/useSocket';
import MessageList from '../components/MessageList';

const ChatPage = () => {
  const {
    socket,
    isConnected,
    username,
    error,
    messages,
    typingUsers,
    sendMessage,
    setTyping,
  } = useSocket();

  const [text, setText] = useState('');

  const selfId = useMemo(() => socket?.id, [socket?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
    setTyping(false);
  };

  const handleTyping = (val) => {
    setText(val);
    setTyping(!!val);
  };

  return (
    <div style={{ maxWidth: 900, margin: '1.5rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Real‑Time Chat</h2>
          <div style={{ fontSize: 12, opacity: 0.8 }}>User: <strong>{username}</strong></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Status: <span style={{ color: isConnected ? '#4caf50' : '#f44336' }}>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
      {error && (
        <div style={{ color: '#f66', marginBottom: 8 }}>
          {error} — ensure the server is running and reachable.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <MessageList messages={messages} selfId={selfId} />
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder={'Type a message'}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #333' }}
            disabled={!isConnected}
          />
          <button type="submit" disabled={!isConnected || !text.trim()}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
