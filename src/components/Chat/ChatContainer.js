import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import ConversationHistory from './ConversationHistory';
import AuthButton from '../OAuth/AuthButton';
import CalendarService from '../../services/calendarService';
import './ChatContainer.css';

const CHAT_API_URL = 'http://localhost:3001/api/chat';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarService] = useState(new CalendarService());
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  
  // System prompt for the assistant
  const systemPrompt = 'You are a helpful, friendly, and knowledgeable assistant powered by the Llama 3.3 70B model. You provide thoughtful, accurate responses while being conversational and engaging. If you\'re not sure about something, be honest about your limitations. You can also help with Google Calendar tasks when the user has connected their calendar.';
  
  const sendMessage = async (content) => {
    if (!content.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Check if message is calendar-related and calendar is connected
      if (isCalendarConnected && isCalendarQuery(content)) {
        try {
          const calendarData = await calendarService.sendCalendarQuery(content);
          
          // For pure calendar queries, show calendar data directly
          const assistantMessage = { 
            role: 'assistant', 
            content: formatCalendarResponse(calendarData)
          };
          
          setMessages((prevMessages) => [...prevMessages, assistantMessage]);
          return; // Skip chat API call
        } catch (calendarError) {
          console.warn('Calendar query failed:', calendarError);
          // Fall through to regular chat if calendar fails
        }
      }
      
      // Create messages array including system prompt and history
      const messagesForAPI = [
        { 
          role: 'system', 
          content: systemPrompt
        },
        ...messages,
        userMessage
      ];
      
      // Call regular chat API for non-calendar queries
      const response = await axios.post(CHAT_API_URL, { messages: messagesForAPI });
      
      // Add assistant response to chat
      const assistantMessage = { 
        role: 'assistant', 
        content: response.data.response 
      };
      
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      };
      
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const isCalendarQuery = (message) => {
    const calendarKeywords = [
      'calendar', 'event', 'meeting', 'appointment', 'schedule',
      'today', 'tomorrow', 'this week', 'next week', 'busy',
      'free time', 'available', 'when', 'what time'
    ];
    
    return calendarKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const formatCalendarResponse = (calendarData) => {
    if (!calendarData || !calendarData.response) {
      return "No calendar information available.";
    }

    // The backend already returns a formatted response
    return calendarData.response;
  };

  const handleAuthSuccess = ({ accessToken, refreshToken }) => {
    calendarService.setTokens(accessToken, refreshToken);
    setIsCalendarConnected(true);
  };

  const handleAuthError = (error) => {
    console.error('Authentication error:', error);
    setIsCalendarConnected(false);
  };
  
  // Function to load a conversation
  const loadConversation = (loadedMessages) => {
    if (loadedMessages && loadedMessages.length > 0) {
      setMessages(loadedMessages.filter(msg => msg.role !== 'system'));
    }
  };
  
  // Function to start a new chat
  const startNewChat = () => {
    if (window.confirm('Start a new chat? This will clear the current conversation.')) {
      setMessages([]);
    }
  };
  
  // Function to clear the current conversation
  const clearConversation = () => {
    if (window.confirm('Are you sure you want to clear the current conversation?')) {
      setMessages([]);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-top">
          <h2>AI Chat Assistant</h2>
          <AuthButton 
            onAuthSuccess={handleAuthSuccess}
            onAuthError={handleAuthError}
          />
        </div>
        <ConversationHistory 
          messages={messages} 
          systemPrompt={systemPrompt}
          onLoadConversation={loadConversation}
        />
      </div>
      
      <ChatWindow messages={messages} isLoading={isLoading} />
      
      <div className="chat-actions">
        {messages.length > 0 ? (
          <>
            <button 
              className="new-chat-btn" 
              onClick={startNewChat}
              title="Start a new chat"
            >
              New Chat
            </button>
            <button 
              className="clear-chat-btn" 
              onClick={clearConversation}
              title="Clear conversation"
            >
              Clear Chat
            </button>
          </>
        ) : (
          <div className="welcome-message">
            <h3>Welcome to AI Chat Assistant</h3>
            <p>Start a conversation by typing a message below.</p>
          </div>
        )}
      </div>
      
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} showSuggestions={true} />
    </div>
  );
};

export default ChatContainer;