// hooks/useSocket.js - React hook wrapping Socket.io client
import { useEffect, useState, useRef } from 'react';
import socket from '../socket/client';
import { makeId } from '../utils/id';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState(null);
  const typingTimeout = useRef(null);
  const usernameRef = useRef(null);
  const getOrCreateUsername = () => {
    let name = localStorage.getItem('rtchat:username');
    if (!name) {
      name = `Guest-${Math.random().toString(36).slice(2, 6)}`;
      localStorage.setItem('rtchat:username', name);
    }
    return name;
  };
  const [username, setUsername] = useState(() => getOrCreateUsername());
  if (!usernameRef.current) usernameRef.current = username;

  const connect = (name) => {
    if (name) {
      usernameRef.current = name;
      setUsername(name);
      localStorage.setItem('rtchat:username', name);
    }
    if (!socket.connected) {
      socket.connect();
    } else if (usernameRef.current) {
      socket.emit('user_join', usernameRef.current);
    }
  };

  const disconnect = () => socket.disconnect();

  const sendMessage = (message) => {
    const clientId = makeId();
    const optimistic = {
      id: clientId,
      clientId,
      message,
      sender: usernameRef.current || 'Me',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    setMessages((prev) => [...prev, optimistic]);
    socket.emit('send_message', { message, clientId });
  };

  const sendPrivateMessage = (to, message) => {
    const clientId = makeId();
    const optimistic = {
      id: clientId,
      clientId,
      message,
      sender: usernameRef.current || 'Me',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      status: 'pending',
      isPrivate: true,
      to,
    };
    setMessages((prev) => [...prev, optimistic]);
    socket.emit('private_message', { to, message, clientId });
  };

  const setTyping = (isTyping) => socket.emit('typing', isTyping);

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      setError(null);
      if (usernameRef.current) {
        socket.emit('user_join', usernameRef.current);
      }
    };
    const onDisconnect = () => setIsConnected(false);
    const onConnectError = (err) => {
      setError(err?.message || 'Connection failed');
    };

    const onReceiveMessage = (message) => {
      setLastMessage(message);
      // Reconcile optimistic own message by clientId
      if (message.senderId === socket.id && message.clientId) {
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.clientId && m.clientId === message.clientId);
          if (idx >= 0) {
            const copy = prev.slice();
            copy[idx] = { ...message };
            return copy;
          }
          return [...prev, message];
        });
      } else {
        setMessages((prev) => [...prev, message]);
      }
    };
    const onPrivateMessage = (message) => {
      setLastMessage(message);
      if (message.senderId === socket.id && message.clientId) {
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.clientId && m.clientId === message.clientId);
          if (idx >= 0) {
            const copy = prev.slice();
            copy[idx] = { ...message };
            return copy;
          }
          return [...prev, message];
        });
      } else {
        setMessages((prev) => [...prev, message]);
      }
    };
    const onUserList = (list) => setUsers(list);
    const onUserJoined = (user) =>
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    const onUserLeft = (user) =>
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    const onTypingUsers = (u) => setTypingUsers(u);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.off('connect_error', onConnectError);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, []);

  // Auto-connect on mount with generated guest name
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    username,
    error,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
  };
};

export default useSocket;
