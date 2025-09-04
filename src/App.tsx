import ChatPanel from './components/ChatPanel';
import InteractiveCanvas from './components/InteractiveCanvas';
import ProgressBar from './components/ProgressBar';
import { useConversationStore } from './features/conversation/useConversationStore';
import { lessonConfig } from './features/learning/lessonScript';
import './App.css';
import React, { useState } from 'react';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: 'red', color: 'white' }}>
          <h1>Something went wrong:</h1>
          <pre>{this.state.error?.message}</pre>
          <pre>{this.state.error?.stack}</pre>
          <button onClick={() => {
            this.setState({ hasError: false });
            window.location.reload();
          }}>
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log('🚀 App component rendering...');
  const [activeTab, setActiveTab] = useState<'chat' | 'lesson'>('lesson'); // Default to lesson on mobile
  
  // Get progress info for header
  const { stepIndex, progress } = useConversationStore();
  
  return (
    <ErrorBoundary>
      <div className="bot-app">
        {/* Enhanced Bot Header with Progress */}
        <div className="bot-header">
          <div className="bot-avatar-large">
            🤖
          </div>
          <div className="bot-intro">
            <h1 className="bot-name">Numbers Tutor AI</h1>
            <p className="bot-tagline">Simple Learning Tool</p>
            <p className="bot-status">
              <span className="status-dot"></span>
              Ready to Learn
            </p>
          </div>
          
          {/* Progress Info in Header */}
          <div className="header-progress">
            <div className="progress-info">
              <span className="progress-label">Lesson Progress</span>
              <div className="progress-stats">
                Step {stepIndex + 1} of {lessonConfig.steps.length}
              </div>
            </div>
            <ProgressBar
              current={stepIndex}
              total={lessonConfig.steps.length}
              completedSteps={progress.completedSteps}
              className="header-progress-bar"
            />
          </div>
        </div>
        
        {/* Clean Two-Panel Layout */}
        <main className="bot-main-panels">
          {/* Left Panel - Conversation */}
          <div className={`chat-panel-container ${activeTab === 'chat' ? 'active' : ''}`}>
            <div className="panel-header">
              <h3>💬 Conversation</h3>
            </div>
            <ChatPanel />
          </div>
          
          {/* Right Panel - Learning Activities */}
          <div className={`canvas-panel-container ${activeTab === 'lesson' ? 'active' : ''}`}>
            <div className="panel-header">
              <h3>🎓 Activities</h3>
            </div>
            <InteractiveCanvas />
          </div>
        </main>
        
        {/* Mobile Tab Switcher */}
        <div className="mobile-tab-switcher">
          <button 
            className={`mobile-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <span className="mobile-tab-icon">💬</span>
            <span className="mobile-tab-label">Chat</span>
          </button>
          <button 
            className={`mobile-tab ${activeTab === 'lesson' ? 'active' : ''}`}
            onClick={() => setActiveTab('lesson')}
          >
            <span className="mobile-tab-icon">🎓</span>
            <span className="mobile-tab-label">Learn</span>
          </button>
        </div>
        
        {/* Bot Footer */}
        <div className="bot-footer">
          <div className="powered-by">
            <span>🤖 Powered by Advanced AI Technology</span>
            <span className="typing-indicator-small">
              <span></span><span></span><span></span>
            </span>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
