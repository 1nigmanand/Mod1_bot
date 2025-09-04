import React, { useState } from 'react';

interface ReflectionBoxProps {
  prompt: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const ReflectionBox: React.FC<ReflectionBoxProps> = ({
  prompt,
  value,
  onChange,
  onSubmit,
  placeholder = 'Share your thoughts and reflections...',
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`reflection-box ${isFocused ? 'focused' : ''}`}>
      <div className="reflection-prompt">
        <h3>🤔 Reflection Time</h3>
        <p>{prompt}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="reflection-form">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="reflection-textarea"
          rows={6}
          disabled={disabled}
        />
        
        <div className="reflection-actions">
          <div className="reflection-hint">
            <small>💡 Tip: Press Ctrl+Enter to submit quickly</small>
          </div>
          
          <button 
            type="submit" 
            className="reflection-submit"
            disabled={!value.trim() || disabled}
          >
            Share Reflection
          </button>
        </div>
      </form>
      
      <div className="reflection-stats">
        <span className="word-count">
          {value.trim().split(/\s+/).filter(word => word.length > 0).length} words
        </span>
      </div>
    </div>
  );
};

export default ReflectionBox;