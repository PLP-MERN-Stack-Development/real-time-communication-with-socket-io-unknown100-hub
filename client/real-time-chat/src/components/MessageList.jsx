import React from 'react';

const bubble = (isSelf) => ({
  alignSelf: isSelf ? 'flex-end' : 'flex-start',
  maxWidth: '75%',
  padding: '8px 10px',
  borderRadius: 10,
  background: isSelf ? '#075E54' : '#2a2a2a',
  color: '#fff',
  marginBottom: 8,
  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
});

const row = { display: 'flex', flexDirection: 'column' };

const tick = (status) => {
  if (status === 'pending') return '✓';
  return '✓✓';
};

const metaStyle = { fontSize: 11, opacity: 0.7, marginTop: 4, display: 'flex', gap: 6, justifyContent: 'flex-end' };

const MessageList = ({ messages, selfId }) => {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem', border: '1px solid #333', borderRadius: 8, minHeight: 300, display: 'flex', flexDirection: 'column' }}>
      {messages.length === 0 && (
        <div style={{ opacity: 0.7 }}>No messages yet. Say hello! 👋</div>
      )}
      {messages.map((m) => {
        const isSelf = m.senderId && m.senderId === selfId;
        const meta = m.system ? 'system' : m.isPrivate ? 'private' : '';
        return (
          <div key={m.id || m.clientId} style={row}>
            {m.system ? (
              <em style={{ alignSelf: 'center', opacity: 0.7 }}>{m.message}</em>
            ) : (
              <div style={bubble(isSelf)}>
                {!isSelf && (
                  <div style={{ fontWeight: 600, marginBottom: 4, color: '#CDE9E6' }}>{m.sender || 'Anonymous'}</div>
                )}
                <div>{m.message}</div>
                <div style={metaStyle}>
                  <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                  {isSelf && <span>{tick(m.status)}</span>}
                  {meta && <span>[{meta}]</span>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
