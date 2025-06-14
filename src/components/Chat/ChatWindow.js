import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { FaRobot } from 'react-icons/fa';
import './ChatWindow.css';

const ChatWindow = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.length === 0 && !isLoading && (
        <div className="empty-chat">
          <div className="empty-chat-icon">
            <FaRobot />
          </div>
          <p>Your conversation will appear here</p>
        </div>
      )}
      
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
      
      {isLoading && (
        <div className="loading-indicator">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;