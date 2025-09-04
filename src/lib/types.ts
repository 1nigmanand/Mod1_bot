// Core message types for the conversation
export interface Message {
  id: string;
  role: 'bot' | 'student';
  text: string;
  timestamp: Date;
  stepId?: string;
}

// Lesson step types
export type LessonStepType = 'bot' | 'question' | 'reflection' | 'quiz' | 'explanation';

export interface LessonStep {
  id: string;
  type: LessonStepType;
  content: string;
  prompt?: string;
  options?: string[];
  answer?: string;
  nextStepId?: string;
  metadata?: Record<string, unknown>;
}

// Quiz and evaluation types
export interface QuizQuestion {
  id: string;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface StudentAnswer {
  stepId: string;
  questionId?: string;
  answer: string;
  isCorrect?: boolean;
  timestamp: Date;
  aiEvaluation?: AIEvaluationResult;
}

// AI Evaluation System
export interface AIEvaluationResult {
  status: 'PASS' | 'FAIL';
  score: number; // 0-100
  feedback: string;
  conceptsToReview?: string[];
  nextAction: 'PROCEED' | 'TUTOR' | 'RETRY';
  tutoringPlan?: TutoringPlan;
}

export interface TutoringPlan {
  targetConcepts: string[];
  questions: TutoringQuestion[];
  approachType: 'guided' | 'conceptual' | 'practical';
  estimatedDuration: number; // in minutes
}

export interface TutoringQuestion {
  id: string;
  type: 'leading' | 'conceptual' | 'verification';
  prompt: string;
  expectedAnswer?: string;
  hints?: string[];
}

// Conversation Context System
export interface ConversationSummary {
  id: string;
  createdAt: Date;
  lastUpdated: Date;
  totalMessages: number;
  keyTopics: string[];
  studentProgress: {
    currentStep: string;
    completedSteps: string[];
    strugglingAreas: string[];
    strengths: string[];
  };
  conversationHighlights: string[];
  summary: string; // Natural language summary of conversation
}

export interface ConversationContext {
  summary: ConversationSummary;
  recentMessages: Message[]; // Last 5-10 messages for immediate context
  currentLessonContext: {
    lessonId: string;
    stepId: string;
    topic: string;
  };
}

// Progress tracking
export interface LessonProgress {
  currentStepIndex: number;
  completedSteps: string[];
  answers: StudentAnswer[];
  reflections: string[];
  startTime: Date;
  lastUpdateTime: Date;
}

// Conversation state
export interface ConversationState {
  stepIndex: number;
  messages: Message[];
  currentStep: LessonStep | null;
  progress: LessonProgress;
  isLoading: boolean;
  error: string | null;
  tutoringMode?: {
    isActive: boolean;
    originalStepId: string;
    plan: TutoringPlan;
    currentQuestionIndex: number;
    attempts: number;
  };
  conversationSummary?: ConversationSummary;
}

// Lesson configuration
export interface LessonConfig {
  id: string;
  title: string;
  description: string;
  steps: LessonStep[];
  estimatedDuration: number; // in minutes
}

// Gemini API types
export interface GeminiRequest {
  prompt: string;
  context?: {
    currentStep?: LessonStep;
    previousMessages?: Message[];
    studentProfile?: StudentProfile;
  };
}

export interface GeminiResponse {
  text: string;
  confidence?: number;
  suggestions?: string[];
}

// Student profile and personalization
export interface StudentProfile {
  id: string;
  name?: string;
  preferredLanguage: 'en' | 'hi';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  completedLessons: string[];
  preferences: {
    pace: 'slow' | 'medium' | 'fast';
    encouragementStyle: 'formal' | 'friendly' | 'enthusiastic';
  };
}

// XState machine context
export interface LessonMachineContext {
  currentStep: LessonStep | null;
  stepIndex: number;
  messages: Message[];
  answers: StudentAnswer[];
  lessonConfig: LessonConfig;
  studentProfile?: StudentProfile;
  error?: string;
}

// XState machine events
export type LessonMachineEvent =
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SUBMIT_ANSWER'; answer: string }
  | { type: 'ASK_GEMINI'; prompt: string }
  | { type: 'RESTART_LESSON' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' };

// Component props types
export interface MessageBubbleProps {
  message: Message;
  isBot: boolean;
}

export interface LessonStepCardProps {
  step: LessonStep;
  onAnswer: (answer: string) => void;
  isActive: boolean;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  completedSteps: string[];
}

export interface ReflectionBoxProps {
  prompt: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Local storage types
export interface StoredProgress {
  lessonId: string;
  progress: LessonProgress;
  lastSaved: Date;
}

// Theme and UI types
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  botMessageColor: string;
  studentMessageColor: string;
}