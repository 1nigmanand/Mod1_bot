import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  ConversationState, 
  Message, 
  StudentAnswer, 
  LessonProgress,
  AIEvaluationResult,
  TutoringPlan,
  ConversationSummary,
  ConversationContext
} from '../../lib/types';
import { lessonConfig } from '../learning/lessonScript';
import { answerQuestion } from '../../ai/geminiClient';
import geminiClient from '../../ai/geminiClient';

interface ConversationStore extends ConversationState {
  // Actions
  initializeLesson: () => void;
  nextStep: () => void;
  previousStep: () => void;
  addMessage: (role: 'bot' | 'student', text: string, stepId?: string) => void;
  submitAnswer: (answer: string) => void;
  addReflection: (reflection: string) => void;
  handleStudentMessage: (message: string) => Promise<void>;
  askOffScriptQuestion: (question: string) => Promise<void>;
  returnToLesson: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetLesson: () => void;
  jumpToStep: (stepIndex: number) => void;
  
  // AI Evaluation System
  evaluateAnswerWithAI: (answer: string) => Promise<void>;
  startTutoringMode: (plan: TutoringPlan, originalStepId: string) => void;
  handleTutoringResponse: (response: string) => Promise<void>;
  generateNextTutoringQuestion: () => Promise<void>;
  exitTutoringMode: (shouldProceed: boolean) => void;
  
  // Conversation Context Management
  updateConversationSummary: () => Promise<void>;
  getConversationContext: () => ConversationContext | null;
  
  // Getters
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  getProgressPercentage: () => number;
  getCurrentStepAnswer: () => StudentAnswer | undefined;
  getLessonContext: () => string;
  isOffScript: () => boolean;
  isInTutoringMode: () => boolean;
}

const initialProgress: LessonProgress = {
  currentStepIndex: 0,
  completedSteps: [],
  answers: [],
  reflections: [],
  startTime: new Date(),
  lastUpdateTime: new Date(),
};

const initialState: ConversationState = {
  stepIndex: 0,
  messages: [],
  currentStep: lessonConfig.steps[0] || null,
  progress: initialProgress,
  isLoading: false,
  error: null,
  tutoringMode: undefined,
};

export const useConversationStore = create<ConversationStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        initializeLesson: () => {
          const firstStep = lessonConfig.steps[0];
          set((state) => ({
            ...state,
            stepIndex: 0,
            currentStep: firstStep,
            messages: firstStep ? [{
              id: `msg-${Date.now()}`,
              role: 'bot' as const,
              text: firstStep.content,
              timestamp: new Date(),
              stepId: firstStep.id,
            }] : [],
            progress: {
              ...initialProgress,
              startTime: new Date(),
              lastUpdateTime: new Date(),
            },
            error: null,
          }));
        },

        nextStep: () => {
          const { stepIndex, currentStep } = get();
          if (!currentStep || stepIndex >= lessonConfig.steps.length - 1) return;

          const nextStepIndex = stepIndex + 1;
          const nextStep = lessonConfig.steps[nextStepIndex];

          if (nextStep) {
            set((state) => ({
              ...state,
              stepIndex: nextStepIndex,
              currentStep: nextStep,
              progress: {
                ...state.progress,
                currentStepIndex: nextStepIndex,
                completedSteps: [...new Set([...state.progress.completedSteps, currentStep.id])],
                lastUpdateTime: new Date(),
              },
            }));

            // Add bot message for the new step
            get().addMessage('bot', nextStep.content, nextStep.id);
          }
        },

        previousStep: () => {
          const { stepIndex } = get();
          if (stepIndex <= 0) return;

          const prevStepIndex = stepIndex - 1;
          const prevStep = lessonConfig.steps[prevStepIndex];

          if (prevStep) {
            set((state) => ({
              ...state,
              stepIndex: prevStepIndex,
              currentStep: prevStep,
              progress: {
                ...state.progress,
                currentStepIndex: prevStepIndex,
                lastUpdateTime: new Date(),
              },
            }));
          }
        },

        addMessage: (role, text, stepId) => {
          const newMessage: Message = {
            id: `msg-${Date.now()}-${Math.random()}`,
            role,
            text,
            timestamp: new Date(),
            stepId,
          };

          set((state) => {
            // Limit messages to prevent memory issues (keep last 50 messages)
            const maxMessages = 50;
            let updatedMessages = [...state.messages, newMessage];
            
            if (updatedMessages.length > maxMessages) {
              // Keep first message (lesson intro) and last 49 messages
              updatedMessages = [updatedMessages[0], ...updatedMessages.slice(-49)];
            }

            return {
              ...state,
              messages: updatedMessages,
            };
          });

          // Trigger conversation summary update after every 6 messages (reduced frequency)
          const messageCount = get().messages.length + 1;
          if (messageCount % 6 === 0) { // Reduced from every 4 to every 6 messages
            setTimeout(() => {
              get().updateConversationSummary().catch(error => {
                console.warn('Failed to update conversation summary:', error);
              });
            }, 2000); // Increased delay to reduce API pressure
          }
        },

        submitAnswer: (answer) => {
          const { currentStep } = get();
          if (!currentStep) return;

          // Add student message
          get().addMessage('student', answer, currentStep.id);

          // For quiz and question types, use AI evaluation
          if (currentStep.type === 'quiz' || currentStep.type === 'question') {
            get().evaluateAnswerWithAI(answer);
          } else {
            // For other types, handle normally
            const newAnswer: StudentAnswer = {
              stepId: currentStep.id,
              questionId: currentStep.id,
              answer,
              isCorrect: currentStep.answer ? answer === currentStep.answer : undefined,
              timestamp: new Date(),
            };

            set((state) => ({
              ...state,
              progress: {
                ...state.progress,
                answers: [...state.progress.answers, newAnswer],
                lastUpdateTime: new Date(),
              },
            }));

            // Auto-advance after a short delay
            setTimeout(() => {
              get().nextStep();
            }, 1500);
          }
        },

        addReflection: (reflection) => {
          const { currentStep } = get();
          if (!currentStep || currentStep.type !== 'reflection') return;

          // Add student reflection message
          get().addMessage('student', reflection, currentStep.id);

          set((state) => ({
            ...state,
            progress: {
              ...state.progress,
              reflections: [...state.progress.reflections, reflection],
              lastUpdateTime: new Date(),
            },
          }));

          // Add encouraging bot response
          const encouragingResponses = [
            "Thank you for sharing your thoughts! That's a great insight.",
            "Excellent reflection! Your thinking shows real understanding.",
            "I appreciate your thoughtful response. Keep that curiosity alive!",
            "Wonderful perspective! Reflection is key to deep learning.",
          ];
          
          const randomResponse = encouragingResponses[Math.floor(Math.random() * encouragingResponses.length)];
          
          setTimeout(() => {
            get().addMessage('bot', randomResponse, currentStep.id);
            setTimeout(() => {
              get().nextStep();
            }, 1000);
          }, 800);
        },

        jumpToStep: (stepIndex) => {
          if (stepIndex < 0 || stepIndex >= lessonConfig.steps.length) return;

          const targetStep = lessonConfig.steps[stepIndex];
          if (targetStep) {
            set((state) => ({
              ...state,
              stepIndex,
              currentStep: targetStep,
              progress: {
                ...state.progress,
                currentStepIndex: stepIndex,
                lastUpdateTime: new Date(),
              },
            }));
          }
        },

        setLoading: (loading) => {
          set((state) => ({
            ...state,
            isLoading: loading,
          }));
        },

        setError: (error) => {
          set((state) => ({
            ...state,
            error,
          }));
        },

        resetLesson: () => {
          set(() => ({
            ...initialState,
            progress: {
              ...initialProgress,
              startTime: new Date(),
              lastUpdateTime: new Date(),
            },
          }));
          get().initializeLesson();
        },

        // AI Evaluation System
        evaluateAnswerWithAI: async (answer: string) => {
          const { currentStep } = get();
          if (!currentStep) return;

          try {
            get().setLoading(true);
            get().setError(null);

            // Get lesson context for AI evaluation
            const lessonContext = get().getLessonContext();
            
            // Get conversation context for AI evaluation
            const conversationContext = get().getConversationContext();
            
            let result;
            
            // Use context-aware evaluation if conversation context is available
            if (conversationContext) {
              const contextForAI = {
                summary: conversationContext.summary.summary,
                recentMessages: conversationContext.recentMessages.map(m => ({
                  role: m.role,
                  text: m.text
                })),
                studentProgress: {
                  strugglingAreas: conversationContext.summary.studentProgress.strugglingAreas,
                  strengths: conversationContext.summary.studentProgress.strengths
                }
              };
              
              result = await geminiClient.evaluateAnswerWithContext(
                currentStep.prompt || currentStep.content,
                answer,
                currentStep.answer,
                contextForAI,
                {
                  stepId: currentStep.id,
                  lessonTopic: lessonContext,
                  previousAttempts: get().progress.answers
                    .filter(a => a.stepId === currentStep.id)
                    .map(a => a.answer)
                }
              );
            } else {
              // Fallback to regular evaluation without context
              result = await geminiClient.evaluateAnswer(
                currentStep.prompt || currentStep.content,
                answer,
                currentStep.answer,
                {
                  stepId: currentStep.id,
                  lessonTopic: lessonContext,
                  previousAttempts: get().progress.answers
                    .filter(a => a.stepId === currentStep.id)
                    .map(a => a.answer)
                }
              );
            }

            const evaluation: AIEvaluationResult = {
              status: result.evaluation.status,
              score: result.evaluation.score,
              feedback: result.evaluation.feedback,
              conceptsToReview: result.evaluation.conceptsToReview,
              nextAction: result.evaluation.nextAction,
              tutoringPlan: result.tutoringPlan ? {
                targetConcepts: result.tutoringPlan.targetConcepts,
                questions: result.tutoringPlan.questions,
                approachType: result.tutoringPlan.approachType,
                estimatedDuration: result.tutoringPlan.estimatedDuration
              } : undefined
            };

            // Create student answer with AI evaluation
            const newAnswer: StudentAnswer = {
              stepId: currentStep.id,
              questionId: currentStep.id,
              answer,
              isCorrect: evaluation.status === 'PASS',
              timestamp: new Date(),
              aiEvaluation: evaluation,
            };

            set((state) => ({
              ...state,
              progress: {
                ...state.progress,
                answers: [...state.progress.answers, newAnswer],
                lastUpdateTime: new Date(),
              },
            }));

            // Show AI feedback
            setTimeout(() => {
              get().addMessage('bot', evaluation.feedback, currentStep.id);
              get().setLoading(false);

              // Handle next action based on AI evaluation
              setTimeout(() => {
                if (evaluation.nextAction === 'PROCEED') {
                  get().addMessage('bot', `<div style="padding: 1rem; background: linear-gradient(135deg, #10b98120, #05966920); border-radius: 8px; border-left: 4px solid #10b981;"><strong style="color: #059669;">✅ Excellent! Let's continue with the next topic.</strong></div>`);
                  setTimeout(() => get().nextStep(), 1000);
                } else if (evaluation.nextAction === 'TUTOR' && evaluation.tutoringPlan) {
                  get().addMessage('bot', `<div style="padding: 1rem; background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 8px; border-left: 4px solid #667eea;"><strong style="color: #667eea;">💡 Let me help you understand this better!</strong><br><p style="color: #374151; margin: 0.5rem 0 0 0;">I'll guide you through some questions to build your understanding step by step.</p></div>`);
                  setTimeout(() => {
                    get().startTutoringMode(evaluation.tutoringPlan!, currentStep.id);
                  }, 1500);
                } else if (evaluation.nextAction === 'RETRY') {
                  get().addMessage('bot', `<div style="padding: 1rem; background: linear-gradient(135deg, #f59e0b20, #d97706020); border-radius: 8px; border-left: 4px solid #f59e0b;"><strong style="color: #d97706;">🔄 Give it another try!</strong><br><p style="color: #374151; margin: 0.5rem 0 0 0;">You're close! Think about it a bit more.</p></div>`);
                }
              }, 1000);
            }, 1000);

          } catch (error) {
            console.error('AI evaluation error:', error);
            get().setError('Sorry, I had trouble evaluating your answer. Let\'s continue.');
            get().setLoading(false);
            
            // Fallback to simple evaluation
            const isCorrect = currentStep.answer ? answer.toLowerCase().includes(currentStep.answer.toLowerCase()) : true;
            const feedbackMessage = isCorrect 
              ? "🎉 Good job! Let's continue." 
              : `Let me help you understand this better.`;
            
            setTimeout(() => {
              get().addMessage('bot', feedbackMessage, currentStep.id);
              if (isCorrect) {
                setTimeout(() => get().nextStep(), 1500);
              }
            }, 500);
          }
        },

        startTutoringMode: (plan: TutoringPlan, originalStepId: string) => {
          set((state) => ({
            ...state,
            tutoringMode: {
              isActive: true,
              originalStepId,
              plan,
              currentQuestionIndex: 0,
              attempts: 0
            }
          }));

          // Start with the first tutoring question
          if (plan.questions.length > 0) {
            const firstQuestion = plan.questions[0];
            get().addMessage('bot', firstQuestion.prompt);
          }
        },

        handleTutoringResponse: async (response: string) => {
          const { tutoringMode } = get();
          if (!tutoringMode || !tutoringMode.isActive) return;

          try {
            get().setLoading(true);
            
            // Add student response
            get().addMessage('student', response);

            const allQuestions = tutoringMode.plan.questions.slice(0, tutoringMode.currentQuestionIndex + 1).map(q => q.prompt);
            const allResponses = get().messages
              .filter(m => m.role === 'student')
              .slice(-tutoringMode.currentQuestionIndex - 1)
              .map(m => m.text);

            // Check if this was the last question or if student is ready
            if (tutoringMode.currentQuestionIndex >= tutoringMode.plan.questions.length - 1) {
              // Evaluate overall tutoring progress
              const progressResult = await geminiClient.evaluateTutoringProgress(
                'Original question from lesson', // TODO: Get actual original question
                allQuestions,
                allResponses,
                tutoringMode.plan.targetConcepts
              );

              get().addMessage('bot', progressResult.feedback);
              get().setLoading(false);

              setTimeout(() => {
                if (progressResult.recommendedAction === 'PROCEED') {
                  get().exitTutoringMode(true);
                } else if (progressResult.recommendedAction === 'RETRY_ORIGINAL') {
                  get().addMessage('bot', `<div style="padding: 1rem; background: linear-gradient(135deg, #10b98120, #05966920); border-radius: 8px;"><strong style="color: #059669;">🎯 Ready to try again!</strong><br><p style="color: #374151; margin: 0.5rem 0 0 0;">Now that we've worked through this together, would you like to try the original question again?</p></div>`);
                  get().exitTutoringMode(false);
                } else {
                  // Continue with more tutoring
                  get().addMessage('bot', '<strong>Let me ask you another question to help solidify your understanding...</strong>');
                  setTimeout(() => {
                    get().generateNextTutoringQuestion();
                  }, 1000);
                }
              }, 1500);
            } else {
              // Move to next tutoring question
              set((state) => ({
                ...state,
                tutoringMode: state.tutoringMode ? {
                  ...state.tutoringMode,
                  currentQuestionIndex: state.tutoringMode.currentQuestionIndex + 1,
                  attempts: state.tutoringMode.attempts + 1
                } : undefined
              }));

              const nextQuestion = tutoringMode.plan.questions[tutoringMode.currentQuestionIndex + 1];
              if (nextQuestion) {
                setTimeout(() => {
                  get().addMessage('bot', nextQuestion.prompt);
                  get().setLoading(false);
                }, 1000);
              }
            }
          } catch (error) {
            console.error('Tutoring response error:', error);
            get().setLoading(false);
            get().addMessage('bot', 'Let me think of another way to help you understand this...');
          }
        },

        generateNextTutoringQuestion: async () => {
          const { tutoringMode } = get();
          if (!tutoringMode) return;

          try {
            const response = await geminiClient.generateTutoringQuestion(
              tutoringMode.plan.targetConcepts[0],
              tutoringMode.plan.questions.map(q => q.prompt),
              get().messages.filter(m => m.role === 'student').slice(-3).map(m => m.text),
              'conceptual'
            );

            get().addMessage('bot', response.text);
          } catch (error) {
            console.error('Error generating tutoring question:', error);
            get().exitTutoringMode(true);
          }
        },

        exitTutoringMode: (shouldProceed: boolean) => {
          set((state) => ({
            ...state,
            tutoringMode: undefined
          }));

          if (shouldProceed) {
            get().addMessage('bot', `<div style="padding: 1rem; background: linear-gradient(135deg, #10b98120, #05966920); border-radius: 8px; border-left: 4px solid #10b981;"><strong style="color: #059669;">🎓 Excellent progress!</strong><br><p style="color: #374151; margin: 0.5rem 0 0 0;">You've mastered this concept. Let's continue with the lesson!</p></div>`);
            setTimeout(() => {
              get().nextStep();
            }, 2000);
          } else {
            get().addMessage('bot', `<div style="padding: 1rem; background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 8px;"><strong style="color: #667eea;">💪 Ready to try again?</strong><br><p style="color: #374151; margin: 0.5rem 0 0 0;">Take your time and think through what we just discussed.</p></div>`);
          }
        },
        // Handle both lesson progression and off-script questions
        handleStudentMessage: async (message: string) => {
          const { currentStep, tutoringMode } = get();
          
          // Check if we're in tutoring mode
          if (tutoringMode && tutoringMode.isActive) {
            await get().handleTutoringResponse(message);
            return;
          }
          
          // First, add the student message
          get().addMessage('student', message);
          
          // Check if this is an expected lesson response
          if (currentStep) {
            const lowerMessage = message.toLowerCase().trim();
            const expectedResponses = [
              'continue', 'next', 'got it', 'i understand', 'tell me more', 'yes', 'ok', 'okay'
            ];
            
            // If it's a simple continuation response, proceed with lesson
            if (expectedResponses.includes(lowerMessage)) {
              if (currentStep.type === 'bot') {
                setTimeout(() => {
                  get().nextStep();
                }, 1000);
              }
              return;
            }
            
            // If it's an answer to a question/quiz, handle it normally
            if (currentStep.type === 'question' && currentStep.options) {
              const matchingOption = currentStep.options.find(option => 
                option.toLowerCase().includes(lowerMessage) || 
                lowerMessage.includes(option.toLowerCase())
              );
              if (matchingOption) {
                get().submitAnswer(matchingOption);
                return;
              }
            }
            
            if (currentStep.type === 'quiz' && currentStep.answer) {
              get().submitAnswer(message);
              return;
            }
            
            if (currentStep.type === 'reflection') {
              get().addReflection(message);
              return;
            }
          }
          
          // If we reach here, it's likely an off-script question
          await get().askOffScriptQuestion(message);
        },

        // Handle questions outside the lesson sequence using Gemini AI
        askOffScriptQuestion: async (question: string) => {
          try {
            get().setLoading(true);
            get().setError(null);
            
            // Get conversation context for AI response
            const conversationContext = get().getConversationContext();
            let response;
            
            if (conversationContext) {
              // Use context-aware question answering
              const contextForAI = {
                summary: conversationContext.summary.summary,
                recentMessages: conversationContext.recentMessages.map(m => ({
                  role: m.role,
                  text: m.text
                })),
                currentStep: {
                  id: conversationContext.currentLessonContext.stepId,
                  topic: conversationContext.currentLessonContext.topic
                }
              };
              
              response = await geminiClient.answerQuestionWithContext(question, contextForAI);
            } else {
              // Fallback to regular question answering
              const lessonContext = get().getLessonContext();
              response = await answerQuestion(question, lessonContext);
            }
            
            // Add AI response
            const aiMessage = `${response.text}\n\n📚 *That's a great question! When you're ready, we can continue with our lesson.*`;
            
            setTimeout(() => {
              get().addMessage('bot', aiMessage);
              get().setLoading(false);
            }, 1000);
            
          } catch (error) {
            console.error('Error answering off-script question:', error);
            get().setError('Sorry, I had trouble processing your question. Let\'s continue with the lesson.');
            
            setTimeout(() => {
              get().addMessage('bot', 'I\'m having trouble with that question right now, but that\'s okay! Let\'s continue with our lesson and you can ask me again later. 😊');
              get().setLoading(false);
            }, 1000);
          }
        },

        // Return to the current lesson step
        returnToLesson: () => {
          const { currentStep } = get();
          if (currentStep) {
            const returnMessage = `Let's continue with our lesson! We were learning about: ${currentStep.content.substring(0, 100)}...`;
            get().addMessage('bot', returnMessage, currentStep.id);
          }
        },

        // Get current lesson context for AI
        getLessonContext: () => {
          const { currentStep, progress, stepIndex } = get();
          const totalSteps = lessonConfig.steps.length;
          
          let context = `We are in a lesson about number systems. `;
          context += `The student is on step ${stepIndex + 1} of ${totalSteps}. `;
          
          if (currentStep) {
            context += `Current topic: ${currentStep.content.substring(0, 150)}. `;
          }
          
          if (progress.completedSteps.length > 0) {
            context += `Topics covered so far: ${progress.completedSteps.join(', ')}. `;
          }
          
          context += `Please provide educational answers related to number systems, binary, decimal, hexadecimal, or computer science basics.`;
          
          return context;
        },

        // Check if currently handling off-script conversation
        isOffScript: () => {
          const { messages, currentStep } = get();
          if (!currentStep || messages.length === 0) return false;
          
          // Look at the last few messages to determine if we're off-script
          const recentMessages = messages.slice(-3);
          const hasOffScriptIndicator = recentMessages.some(msg => 
            msg.text.includes('*That\'s a great question!*') || 
            msg.text.includes('📚 *That\'s a great question!')
          );
          
          return hasOffScriptIndicator;
        },

        // Check if currently in tutoring mode
        isInTutoringMode: () => {
          const { tutoringMode } = get();
          return tutoringMode?.isActive || false;
        },

        // Conversation Context Management
        updateConversationSummary: async () => {
          // Prevent concurrent summary updates
          const state = get();
          if (state.isLoading) {
            console.log('Skipping summary update - already loading');
            return;
          }

          try {
            const { messages, currentStep, conversationSummary } = get();
            
            // Skip if no messages to summarize
            if (messages.length < 2) return;

            // Get recent messages for summarization (last 10 messages or all if less)
            const recentMessages = messages.slice(-10).map(m => ({
              role: m.role,
              text: m.text,
              timestamp: m.timestamp
            }));

            const currentStepInfo = currentStep ? {
              id: currentStep.id,
              topic: get().getLessonContext()
            } : undefined;

            // Call summarization API
            const summaryResult = await geminiClient.summarizeConversation(
              recentMessages,
              currentStepInfo,
              conversationSummary?.summary
            );

            // Create new conversation summary
            const newSummary: ConversationSummary = {
              id: conversationSummary?.id || `summary-${Date.now()}`,
              createdAt: conversationSummary?.createdAt || new Date(),
              lastUpdated: new Date(),
              totalMessages: messages.length,
              keyTopics: summaryResult.keyTopics,
              studentProgress: summaryResult.studentProgress,
              conversationHighlights: summaryResult.conversationHighlights,
              summary: summaryResult.summary
            };

            set((state) => ({
              ...state,
              conversationSummary: newSummary
            }));

          } catch (error) {
            console.error('Failed to update conversation summary:', error);
          }
        },

        getConversationContext: (): ConversationContext | null => {
          const { conversationSummary, messages, currentStep } = get();
          
          if (!conversationSummary) return null;

          // Get last 5 messages for immediate context
          const recentMessages = messages.slice(-5);

          return {
            summary: conversationSummary,
            recentMessages,
            currentLessonContext: {
              lessonId: 'number_systems_intro', // TODO: Make this dynamic
              stepId: currentStep?.id || 'unknown',
              topic: get().getLessonContext()
            }
          };
        },

        // Getters
        canGoNext: () => {
          const { stepIndex } = get();
          return stepIndex < lessonConfig.steps.length - 1;
        },

        canGoPrevious: () => {
          const { stepIndex } = get();
          return stepIndex > 0;
        },

        getProgressPercentage: () => {
          const { progress } = get();
          return Math.round((progress.completedSteps.length / lessonConfig.steps.length) * 100);
        },

        getCurrentStepAnswer: () => {
          const { currentStep, progress } = get();
          if (!currentStep) return undefined;
          return progress.answers.find(answer => answer.stepId === currentStep.id);
        },
      }),
      {
        name: 'conversation-store', // unique name for localStorage
        partialize: (state) => ({
          stepIndex: state.stepIndex,
          messages: state.messages,
          progress: state.progress,
          currentStep: state.currentStep,
        }),
        // Handle Date object serialization in the onRehydrateStorage callback
        onRehydrateStorage: () => (state) => {
          if (state?.messages) {
            state.messages = state.messages.map((msg: Message) => ({
              ...msg,
              timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
            }));
          }
          if (state?.progress) {
            if (state.progress.startTime && typeof state.progress.startTime === 'string') {
              state.progress.startTime = new Date(state.progress.startTime);
            }
            if (state.progress.lastUpdateTime && typeof state.progress.lastUpdateTime === 'string') {
              state.progress.lastUpdateTime = new Date(state.progress.lastUpdateTime);
            }
            if (state.progress.answers) {
              state.progress.answers = state.progress.answers.map((answer: StudentAnswer) => ({
                ...answer,
                timestamp: typeof answer.timestamp === 'string' ? new Date(answer.timestamp) : answer.timestamp
              }));
            }
          }
        },
      }
    ),
    {
      name: 'conversation-store', // devtools name
    }
  )
);

// Selectors for optimized re-renders
export const useCurrentStep = () => useConversationStore((state) => state.currentStep);
export const useMessages = () => useConversationStore((state) => state.messages);
export const useProgress = () => useConversationStore((state) => state.progress);
export const useIsLoading = () => useConversationStore((state) => state.isLoading);
export const useError = () => useConversationStore((state) => state.error);