import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MessageInbox.css';

interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientProfileId: string;
  createdAt: string;
  sender: { name: string };
  recipientProfile: { name: string };
}

const MessageInbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/messages', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="neumorphic-loading">
        <div className="neumorphic-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="neumorphic-alert error">{error}</div>
    );
  }

  return (
    <div className="message-inbox-container">
      <div className="neumorphic-container">
        <h2 className="text-center">Message Inbox</h2>
        <div className="message-list">
          {messages.map((message) => (
            <div className="neumorphic-card message-card" key={message.id}>
              <div className="message-content">{message.content}</div>
              <div className="message-meta">
                <span>From: <b>{message.sender.name}</b></span>
                <span>To: <b>{message.recipientProfile.name}</b></span>
                <span>{new Date(message.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageInbox; 