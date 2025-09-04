import React, { useState } from 'react';
import { useConversationStore } from '../features/conversation/useConversationStore';
import LessonStepCard from './LessonStepCard';

const InteractiveCanvas: React.FC = () => {
  const {
    currentStep,
    stepIndex,
    progress,
    isLoading,
    submitAnswer,
    addReflection,
    canGoNext,
    canGoPrevious,
    nextStep,
    previousStep,
    resetLesson
  } = useConversationStore();

  const [userInput, setUserInput] = useState('');

  const handleAnswerSubmit = (answer: string) => {
    submitAnswer(answer);
    setUserInput('');
  };

  const handleReflectionSubmit = (reflection: string) => {
    addReflection(reflection);
    setUserInput('');
  };

  const handleManualInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      if (currentStep?.type === 'reflection') {
        addReflection(userInput.trim());
      } else {
        submitAnswer(userInput.trim());
      }
      setUserInput('');
    }
  };

  const getStepTypeLabel = () => {
    if (!currentStep) return 'Learning';
    switch (currentStep.type) {
      case 'question': return 'Interactive Question';
      case 'quiz': return 'Quiz Challenge';
      case 'reflection': return 'Reflection Time';
      case 'bot': return 'Learning Content';
      default: return 'Learning Activity';
    }
  };

  const shouldShowStepCard = () => {
    return currentStep && (
      currentStep.type === 'question' || 
      currentStep.type === 'quiz' || 
      currentStep.type === 'reflection'
    );
  };

  const shouldShowManualInput = () => {
    return currentStep && (
      currentStep.type === 'quiz' || 
      currentStep.type === 'reflection' ||
      (currentStep.type === 'question' && !currentStep.options)
    );
  };

  if (!currentStep) {
    return (
      <div className="canvas-content">
        <div className="canvas-placeholder">
          <div className="placeholder-icon">🎯</div>
          <h3>Ready to Learn!</h3>
          <p>Start the conversation to begin your learning journey.</p>
          <button 
            onClick={resetLesson}
            className="btn btn-primary btn-lg"
          >
            Start New Lesson
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-content">
      {/* Interactive Content Area */}
      <div className="canvas-interactive-area">
        {shouldShowStepCard() ? (
          <LessonStepCard
            step={currentStep}
            onAnswer={handleAnswerSubmit}
            onReflection={handleReflectionSubmit}
            isActive={true}
            disabled={isLoading}
          />
        ) : (
          <div className="content-display">
            <div className="content-card">
              <h3>{getStepTypeLabel()}</h3>
              <p>{currentStep.content}</p>
              {currentStep.type === 'bot' && (
                <div className="content-actions">
                  <button 
                    onClick={nextStep}
                    disabled={!canGoNext() || isLoading}
                    className="btn btn-success"
                  >
                    Continue Learning →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Input for Complex Responses */}
        {shouldShowManualInput() && (
          <div className="manual-input-section">
            <form onSubmit={handleManualInput} className="canvas-input-form">
              <div className="input-group">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={
                    currentStep?.type === 'quiz' 
                      ? 'Type your answer here...'
                      : 'Share your thoughts and reflections...'
                  }
                  className="canvas-textarea"
                  disabled={isLoading}
                  rows={4}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!userInput.trim() || isLoading}
                >
                  {currentStep?.type === 'reflection' ? 'Share Reflection' : 'Submit Answer'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Simple Navigation Controls */}
      <div className="canvas-navigation">
        <button 
          onClick={previousStep}
          disabled={!canGoPrevious() || isLoading}
          className="btn btn-secondary btn-sm"
        >
          ← Previous
        </button>
        
        <div className="step-indicator">
          Step {stepIndex + 1} of {progress.completedSteps.length + 1}
        </div>

        <button 
          onClick={nextStep}
          disabled={!canGoNext() || isLoading}
          className="btn btn-secondary btn-sm"
        >
          Next →
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="canvas-loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Processing your response...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveCanvas;