import React, { useEffect, useRef, useState } from 'react';
import { useConversationStore } from '../features/conversation/useConversationStore';
import MessageBubble from './MessageBubble';

const ChatPanel: React.FC = () => {
  const {
    messages,
    currentStep,
    isLoading,
    error,
    initializeLesson,
    handleStudentMessage,
    isOffScript,
    isInTutoringMode,
    returnToLesson
  } = useConversationStore();

  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize lesson on component mount
  useEffect(() => {
    if (messages.length === 0) {
      initializeLesson();
    }
  }, [initializeLesson, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use timeout to ensure DOM is updated
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  // Update scroll behavior based on content
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      // Force scroll to bottom for better UX
      const shouldScrollToBottom = container.scrollHeight > container.clientHeight;
      container.setAttribute('data-scroll', shouldScrollToBottom ? 'top' : 'bottom');
      
      // Ensure container can scroll
      if (shouldScrollToBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages]);

  const handleQuickResponse = async (response: string) => {
    try {
      await handleStudentMessage(response);
      setUserInput('');
    } catch (error) {
      console.error('Failed to handle quick response:', error);
      // Error is handled by the store, just clear input
      setUserInput('');
    }
  };

  const handleManualInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      try {
        await handleStudentMessage(userInput.trim());
        setUserInput('');
      } catch (error) {
        console.error('Failed to handle manual input:', error);
        // Error is handled by the store, just clear input
        setUserInput('');
      }
    }
  };

  const getQuickResponses = () => {
    if (!currentStep) return [];
    
    // Base responses for lesson progression
    const baseResponses = ['Continue', 'Got it!'];
    
    // Add context-specific responses based on step type
    if (currentStep.type === 'bot') {
      return [...baseResponses, 'Tell me more', 'I have a question'];
    }
    
    if (currentStep.type === 'question') {
      return ['I need help', 'Explain this', 'I have a question'];
    }
    
    if (currentStep.type === 'quiz') {
      return ['I need a hint', 'Explain this topic', 'I have a question'];
    }
    
    if (currentStep.type === 'reflection') {
      return ['I need help thinking', 'Can you give an example?', 'I have a question'];
    }
    
    return baseResponses;
  };

  return (
    <div className="chat-panel">
      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => useConversationStore.getState().setError(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Messages Container - Main Focus */}
      <div 
        ref={chatContainerRef}
        className="messages-container"
      >
        <div className="messages-list">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
            />
          ))}
          
          {isLoading && (
            <div className="loading-message">
              <div className="bot-avatar">
                🤖
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Off-script mode indicator - Only when needed */}
      {isOffScript() && (
        <div className="off-script-indicator">
          <div className="off-script-message">
            <span className="icon">💡</span>
            <span>Exploring beyond the lesson</span>
            <button 
              onClick={returnToLesson}
              className="btn btn-secondary btn-sm"
            >
              Return to Lesson
            </button>
          </div>
        </div>
      )}

      {/* Tutoring mode indicator - When AI is providing personalized help */}
      {isInTutoringMode() && (
        <div className="tutoring-mode-indicator">
          <div className="tutoring-message">
            <span className="icon">🧠</span>
            <span>AI Tutor Mode - I'm helping you understand this concept step by step</span>
            <div className="tutoring-badge">Personalized Learning</div>
          </div>
        </div>
      )}

      {/* Chat Input - Clean and Simple */}
      <div className="chat-input-section">
        {/* Quick Response Buttons - Contextual */}
        {!isLoading && getQuickResponses().length > 0 && (
          <div className="quick-responses">
            {getQuickResponses().map((response, index) => (
              <button
                key={index}
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickResponse(response)}
                disabled={isLoading}
              >
                {response}
              </button>
            ))}
          </div>
        )}

        {/* Main Input Form */}
        <form onSubmit={handleManualInput} className="input-form">
          <div className="input-container">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask a question or respond to continue the lesson..."
              className="message-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!userInput.trim() || isLoading}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;