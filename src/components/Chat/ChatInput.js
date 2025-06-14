import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import './ChatInput.css';

const ChatInput = ({ onSendMessage, isLoading, showSuggestions = false }) => {
  const [message, setMessage] = useState('');

  const suggestedPrompts = [
    "Tell me about today's schedule",
    "Tell me about my plans for this week",
    "What's your impression of my schedule this week?"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onSendMessage(suggestion);
  };

  return (
    <div className="chat-input-container">
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={!message.trim() || isLoading}
          className={isLoading ? 'loading' : ''}
        >
          <FaPaperPlane />
        </button>
      </form>
      {showSuggestions && (
        <div className="suggested-prompts">
          <p>Try asking:</p>
          <div className="suggestions">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                className="suggestion-btn"
                onClick={() => handleSuggestionClick(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInput;