import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  completedSteps: string[];
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total, 
  completedSteps, 
  className = '' 
}) => {
  const percentage = Math.round((current / total) * 100);
  const completionPercentage = Math.round((completedSteps.length / total) * 100);

  return (
    <div className={`progress-bar-container ${className}`}>
      <div className="progress-info">
        <span className="progress-text">
          Step {current + 1} of {total}
        </span>
        <span className="progress-percentage">
          {completionPercentage}% Complete
        </span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
        <div 
          className="progress-completion"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      
      <div className="progress-steps">
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={`progress-step ${
              index <= current ? 'current' : ''
            } ${
              completedSteps.length > index ? 'completed' : ''
            }`}
            title={`Step ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;