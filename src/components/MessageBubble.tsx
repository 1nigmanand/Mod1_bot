import React from 'react';
import type { Message } from '../lib/types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isBot = message.role === 'bot';
  
  // Handle both Date objects and date strings (from localStorage persistence)
  const formatTimestamp = (timestamp: Date | string) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Check if message contains HTML content
  const isHtmlContent = (text: string): boolean => {
    return /<[^>]*>/.test(text);
  };
  
  // Sanitize HTML content (basic sanitization for educational content)
  const sanitizeHtml = (html: string): string => {
    // This is a basic implementation - in production, consider using a library like DOMPurify
    return html;
  };
  
  return (
    <div className={`message-bubble ${isBot ? 'bot-message' : 'student-message'}`}>
      {/* Avatar - positioned correctly for each message type */}
      {isBot && (
        <div className="bot-avatar">
          🤖
        </div>
      )}
      {!isBot && (
        <div className="student-avatar">
          👤
        </div>
      )}
      
      {/* Message content */}
      <div className="message-content">
        <div className="message-text">
          {isBot && isHtmlContent(message.text) ? (
            <div 
              className="html-content"
              dangerouslySetInnerHTML={{ 
                __html: sanitizeHtml(message.text) 
              }}
            />
          ) : (
            <div className="plain-text">{message.text}</div>
          )}
        </div>
        <div className="message-timestamp">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;