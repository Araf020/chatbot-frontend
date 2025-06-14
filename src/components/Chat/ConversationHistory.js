import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSave, FaHistory, FaTrash } from 'react-icons/fa';
import './ConversationHistory.css';

const API_URL = 'http://localhost:3001/api/conversations';

const ConversationHistory = ({ messages, systemPrompt, onLoadConversation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Function to save the current conversation
  const saveConversation = async () => {
    if (messages.length === 0) return;
    
    setIsSaving(true);
    try {
      await axios.post(API_URL, {
        messages,
        systemPrompt
      });
      alert('Conversation saved successfully!');
      // Refresh conversation list after saving
      // fetchConversations();
    } catch (error) {
      console.error('Error saving conversation:', error);
      alert('Failed to save conversation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Get a timestamp-based name for the conversation
  const getConversationName = (messages) => {
    if (messages.length === 0) return 'Empty Conversation';
    
    // Use the first user message as the name, limited to 30 chars
    const firstUserMessage = messages.find(m => m.role === 'user');
    const name = firstUserMessage ? firstUserMessage.content : 'New Conversation';
    return name.length > 30 ? name.substring(0, 27) + '...' : name;
  };
  
  return (
    <div className="conversation-history">
      <button 
        className="history-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title="Conversation Options"
      >
        <FaHistory />
      </button>
      
      {isMenuOpen && (
        <div className="history-menu">
          <button 
            onClick={saveConversation} 
            disabled={messages.length === 0 || isSaving}
          >
            <FaSave /> {isSaving ? 'Saving...' : 'Save Conversation'}
          </button>
          
          {/* Conversation list would go here when we implement fetching */}
          {/* For now, just show the save button */}
          
          <div className="history-info">
            {messages.length === 0 ? (
              <p>No active conversation</p>
            ) : (
              <p>Current: {getConversationName(messages)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;