// TODO: Fix XState v5 compatibility issues
// For now, using Zustand store for state management
// This file will be updated once XState integration is fixed

export const useLessonMachine = () => {
  // Placeholder - will implement proper XState machine later
  return {
    state: { matches: () => false, hasTag: () => false, can: () => false, context: {} },
    send: () => {},
    currentStep: null,
    stepIndex: 0,
    messages: [],
    answers: [],
    error: null,
    isLoading: false,
    isComplete: false,
    nextStep: () => {},
    previousStep: () => {},
    submitAnswer: () => {},
    askGemini: () => {},
    restart: () => {},
    clearError: () => {},
    canGoNext: false,
    canGoPrevious: false,
    getProgress: () => ({ current: 0, total: 1, percentage: 0 })
  };
};