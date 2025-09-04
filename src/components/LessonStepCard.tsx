import React, { useState } from 'react';
import type { LessonStep } from '../lib/types';

interface LessonStepCardProps {
  step: LessonStep;
  onAnswer: (answer: string) => void;
  onReflection: (reflection: string) => void;
  isActive: boolean;
  disabled?: boolean;
}

const LessonStepCard: React.FC<LessonStepCardProps> = ({ 
  step, 
  onAnswer, 
  onReflection, 
  isActive, 
  disabled = false 
}) => {
  const [textInput, setTextInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step.type === 'question' && step.options) {
      if (selectedOption) {
        onAnswer(selectedOption);
        setSelectedOption('');
      }
    } else if (step.type === 'quiz') {
      if (textInput.trim()) {
        onAnswer(textInput.trim());
        setTextInput('');
      }
    } else if (step.type === 'reflection') {
      if (textInput.trim()) {
        onReflection(textInput.trim());
        setTextInput('');
      }
    }
  };

  const renderQuestionOptions = () => {
    if (!step.options) return null;

    return (
      <div className="question-options">
        {step.options.map((option, index) => (
          <label key={index} className="option-label">
            <input
              type="radio"
              name="question-option"
              value={option}
              checked={selectedOption === option}
              onChange={(e) => setSelectedOption(e.target.value)}
              disabled={disabled}
            />
            <span className="option-text">{option}</span>
          </label>
        ))}
      </div>
    );
  };

  const renderTextInput = () => {
    const placeholder = step.type === 'quiz' 
      ? 'Type your answer...' 
      : 'Share your thoughts...';

    return (
      <div className="text-input-section">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={placeholder}
          className="step-textarea"
          rows={step.type === 'reflection' ? 4 : 2}
          disabled={disabled}
        />
      </div>
    );
  };

  const canSubmit = () => {
    if (disabled) return false;
    
    if (step.type === 'question' && step.options) {
      return selectedOption.length > 0;
    }
    return textInput.trim().length > 0;
  };

  if (!isActive) return null;

  return (
    <div className={`lesson-step-card ${step.type}`}>
      <div className="step-header">
        <span className="step-type-badge">{step.type}</span>
      </div>
      
      <div className="step-content">
        {step.prompt && (
          <div className="step-prompt">
            {step.prompt}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="step-form">
        {step.type === 'question' && step.options && renderQuestionOptions()}
        
        {(step.type === 'quiz' || step.type === 'reflection') && renderTextInput()}
        
        <div className="step-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!canSubmit()}
          >
            {step.type === 'reflection' ? 'Share Reflection' : 'Submit Answer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonStepCard;