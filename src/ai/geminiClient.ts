import type { GeminiRequest, GeminiResponse, ApiResponse } from '../lib/types';

class GeminiClient {
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Send a prompt to Gemini API via server proxy
   */
  async askGemini(request: GeminiRequest): Promise<GeminiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<GeminiResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      return data.data || { text: 'No response received' };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to communicate with Gemini API'
      );
    }
  }

  /**
   * Generate an explanation for a concept with HTML formatting
   */
  async explainConcept(
    concept: string, 
    context?: { 
      studentLevel?: string;
      previousContent?: string;
    }
  ): Promise<GeminiResponse> {
    const prompt = `Hey there! 😊 I'm your friendly learning buddy, here to make "${concept}" super clear and exciting for you! ${
      context?.studentLevel 
        ? `I know you're at ${context.studentLevel} level, so I'll explain it just right for you.` 
        : ''
    } ${
      context?.previousContent 
        ? `Building on what we discussed earlier: ${context.previousContent}` 
        : ''
    }
    
Let me break this down in a way that'll make you go "Aha! Now I get it!" 💡
    
IMPORTANT: Format your response using beautiful HTML and inline CSS that feels warm and encouraging:
    - <h3 style="color: #667eea; margin-bottom: 1rem; font-weight: 700; font-size: 1.25rem; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">🎆 Let's explore ${concept} together!</h3> for headings
    - <p style="margin-bottom: 1rem; line-height: 1.6; color: #374151; font-size: 1rem;">friendly explanations</p> for paragraphs
    - <strong style="color: #059669; font-weight: 600;">important points</strong> for emphasis
    - <code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; color: #dc2626; font-weight: 500; border: 1px solid #e5e7eb;">technical terms</code>
    - <div style="background: linear-gradient(135deg, #667eea20, #764ba220); padding: 1.5rem; border-radius: 12px; border-left: 4px solid #667eea; margin: 1rem 0; color: #374151; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);"><strong style="color: #667eea; font-size: 1.1rem;">🌟 Example Time!</strong><br><span style="color: #374151; line-height: 1.5; margin-top: 0.5rem; display: inline-block;">friendly examples that connect to real life</span></div>
    - <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #374151;"><li style="margin-bottom: 0.75rem; color: #374151; line-height: 1.5;">easy-to-understand points</li></ul> for lists
    
STYLING REQUIREMENTS:
- Use consistent spacing: margin-bottom: 1rem between elements
- Apply proper padding: 1.5rem for containers
- Include subtle shadows: box-shadow: 0 2px 8px rgba(0,0,0,0.1) for depth
- Ensure readable line-height: 1.5-1.6 for all text
- Use modern border-radius: 12px for containers, 4px for small elements
- Add proper font-weights: 600 for emphasis, 700 for headings
- Include subtle borders: border: 1px solid #e5e7eb for definition
    
Make it feel like you're talking to a curious friend! Use:
- Encouraging phrases like "You've got this!", "This is actually really cool!", "Let me show you something amazing!"
- Real-world examples they can relate to
- Simple analogies that make complex ideas click
- Plenty of emojis to keep it fun and engaging
- Questions that spark curiosity
- A tone that says "We're learning this together!"

End with something that makes them excited to learn more! 🚀`;

    return this.askGemini({
      prompt,
      context: {
        studentProfile: {
          id: 'current-student',
          preferredLanguage: 'en',
          learningStyle: 'mixed',
          currentLevel: (context?.studentLevel as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
          completedLessons: [],
          preferences: {
            pace: 'medium',
            encouragementStyle: 'friendly'
          }
        } as const
      }
    });
  }

  /**
   * Get encouraging feedback for student answers with HTML formatting
   */
  async provideFeedback(
    answer: string,
    correctAnswer?: string,
    isCorrect?: boolean
  ): Promise<GeminiResponse> {
    let prompt = `As an encouraging tutor, provide feedback for this student answer: "${answer}".`;
    
    if (correctAnswer && isCorrect !== undefined) {
      if (isCorrect) {
        prompt += ` The answer is correct! Provide positive reinforcement and maybe an interesting related fact.`;
      } else {
        prompt += ` The correct answer was "${correctAnswer}". Provide gentle correction with encouragement and explain why the correct answer is right.`;
      }
    } else {
      prompt += ` This is a reflection or open-ended response. Provide thoughtful, encouraging feedback that validates their thinking.`;
    }

    prompt += ` Keep it brief, positive, and motivating.
    
    IMPORTANT: Format your response using HTML and inline CSS for beautiful display. Use:
    - <div style="background: ${isCorrect ? 'linear-gradient(135deg, #10b98120, #05966920); border-left: 4px solid #10b981;' : 'linear-gradient(135deg, #f59e0b20, #d97706020); border-left: 4px solid #f59e0b;'} padding: 1.5rem; border-radius: 12px; margin: 0.5rem 0;">
    - <strong style="color: ${isCorrect ? '#059669' : '#d97706'}; font-weight: 600;">${isCorrect ? '✅ Great job!' : '💡 Let\'s learn together!'}</strong> for the header
    - <p style="margin: 0.5rem 0 0 0; color: #374151; line-height: 1.5;">feedback content</p>
    - Use emojis like 🎉, 💫, ✨, 🔥 to make it engaging`;

    return this.askGemini({ prompt });
  }

  /**
   * Generate a hint for struggling students
   */
  async generateHint(
    question: string,
    previousAttempts: string[]
  ): Promise<GeminiResponse> {
    const prompt = `A student is having trouble with this question: "${question}". 
    They've tried these answers: ${previousAttempts.join(', ')}. 
    Provide a helpful hint that guides them toward the right answer without giving it away directly. 
    Be encouraging and focus on the reasoning process.`;

    return this.askGemini({ prompt });
  }

  /**
   * Answer student's free-form questions with HTML formatting
   */
  async answerQuestion(
    question: string,
    lessonContext?: string
  ): Promise<GeminiResponse> {
    const prompt = `Hi there! 😊 A curious student just asked me: "${question}". 
    ${lessonContext ? `Here's what we've been exploring together: ${lessonContext}` : ''}
    
    I love questions like this! It shows you're really thinking deeply. Let me help you understand this in a way that'll make it click! 💡
    
    IMPORTANT: Format your response like you're a friendly mentor who's genuinely excited to help. Use warm HTML and inline CSS:
    - <h3 style="color: #667eea; margin-bottom: 1rem; font-weight: 700; font-size: 1.25rem; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">🎆 Great question! Let's explore this together</h3> for headings
    - <p style="margin-bottom: 1rem; line-height: 1.6; color: #374151; font-size: 1rem;">friendly, conversational explanations</p> for paragraphs
    - <strong style="color: #059669; font-weight: 600;">important insights</strong> for emphasis
    - <code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; color: #dc2626; border: 1px solid #e5e7eb;">technical terms</code> for code
    - <div style="background: linear-gradient(135deg, #667eea20, #764ba220); padding: 1.5rem; border-radius: 12px; border-left: 4px solid #667eea; margin: 1rem 0; color: #374151; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);"><strong style="color: #667eea; font-size: 1.1rem;">🌟 Here's a cool example!</strong><br><span style="color: #374151; line-height: 1.5; margin-top: 0.5rem; display: inline-block;">relatable examples</span></div> for examples
    - <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #374151;"><li style="margin-bottom: 0.75rem; color: #374151; line-height: 1.5;">easy points to understand</li></ul> for lists
    - Use emojis (🔢, 💻, ✨, 🎯, 💡) to keep it engaging and fun
    
COMPREHENSIVE STYLING REQUIREMENTS:
- Consistent spacing: margin-bottom: 1rem for all elements
- Professional padding: 1.5rem for containers, 0.25rem for inline elements
- Visual depth: box-shadow: 0 2px 8px rgba(0,0,0,0.1) for containers
- Readable typography: line-height: 1.5-1.6, proper font-weights
- Modern borders: border-radius: 12px for large elements, 4px for small
- Subtle borders: border: 1px solid #e5e7eb where appropriate
- Text shadows for headings: text-shadow: 0 1px 2px rgba(0,0,0,0.1)
    
Make it sound like you're having a friendly chat! Use phrases like:
    - "You know what's really cool about this?"
    - "Let me show you something awesome!"
    - "This is actually simpler than it sounds!"
    - "Here's what blew my mind when I first learned this..."
    
End with encouragement to keep asking great questions! 🚀`;

    return this.askGemini({ prompt });
  }

  /**
   * Generate personalized encouragement
   */
  async generateEncouragement(
    studentProgress: {
      completedSteps: number;
      totalSteps: number;
      recentPerformance: 'good' | 'struggling' | 'excellent';
    }
  ): Promise<GeminiResponse> {
    const { completedSteps, totalSteps, recentPerformance } = studentProgress;
    const progressPercent = Math.round((completedSteps / totalSteps) * 100);

    const prompt = `Generate encouraging words for a student who has completed ${completedSteps} out of ${totalSteps} steps (${progressPercent}% progress) in a number systems lesson. 
    Their recent performance has been ${recentPerformance}. 
    Keep it brief, motivating, and specific to their progress. 
    Use appropriate emoji and maintain an enthusiastic but not overwhelming tone.`;

    return this.askGemini({ prompt });
  }

  /**
   * Evaluate student answer with AI and provide pass/fail assessment
   */
  async evaluateAnswer(
    question: string,
    studentAnswer: string,
    correctAnswer?: string,
    context?: {
      stepId: string;
      lessonTopic: string;
      previousAttempts?: string[];
    }
  ): Promise<{
    evaluation: {
      status: 'PASS' | 'FAIL';
      score: number;
      feedback: string;
      conceptsToReview?: string[];
      nextAction: 'PROCEED' | 'TUTOR' | 'RETRY';
    };
    tutoringPlan?: {
      targetConcepts: string[];
      questions: Array<{
        id: string;
        type: 'leading' | 'conceptual' | 'verification';
        prompt: string;
        expectedAnswer?: string;
        hints?: string[];
      }>;
      approachType: 'guided' | 'conceptual' | 'practical';
      estimatedDuration: number;
    };
  }> {
    const prompt = `You are a friendly, encouraging AI mentor - like a supportive teacher who genuinely cares about the student's learning journey. Your tone should be warm, patient, and motivating.

QUESTION: "${question}"
STUDENT ANSWER: "${studentAnswer}"
${correctAnswer ? `EXPECTED ANSWER: "${correctAnswer}"` : ''}
${context?.lessonTopic ? `LESSON TOPIC: ${context.lessonTopic}` : ''}
${context?.previousAttempts ? `PREVIOUS ATTEMPTS: ${context.previousAttempts.join(', ')}` : ''}

Evaluate this answer as a caring mentor would. Use encouraging language and respond with JSON:

{
  "evaluation": {
    "status": "PASS" or "FAIL",
    "score": number from 0-100,
    "feedback": "friendly, encouraging HTML-formatted feedback that celebrates effort and guides learning",
    "conceptsToReview": ["specific concepts to explore together"],
    "nextAction": "PROCEED" (if good understanding) or "TUTOR" (if needs gentle guidance) or "RETRY" (if close to understanding)
  },
  "tutoringPlan": {
    "targetConcepts": ["concepts to explore in a fun way"],
    "questions": [
      {
        "id": "unique_id",
        "type": "leading", "conceptual" or "verification",
        "prompt": "friendly question that builds confidence while teaching",
        "expectedAnswer": "what we're hoping they'll discover",
        "hints": ["gentle hints that encourage exploration"]
      }
    ],
    "approachType": "guided", "conceptual", or "practical",
    "estimatedDuration": number_in_minutes
  }
}

FEEDBACK STYLE GUIDE:
- Start with encouragement (🌟, 💡, 🎉)
- Acknowledge their effort and thinking process
- Use phrases like "Great thinking!", "You're on the right track!", "Let's explore this together!"
- Be specific about what they did well
- Frame mistakes as learning opportunities
- Use emojis to make it engaging
- Keep language simple and friendly
- End with motivation to continue learning

For PASS status: Celebrate their success and build confidence
For FAIL status: Be extra encouraging - "Let's work on this together!" tone

CRITICAL COLOR CONTRAST RULES for HTML formatting:
- ALWAYS use dark text colors: #374151, #1f2937, or #4b5563 for main text
- NEVER use white (#ffffff) or light colors for text content
- Use light backgrounds with dark text only
- Example: <p style="color: #374151;">Your readable text here</p>
- For emphasis: <strong style="color: #059669;">emphasized text</strong>
- Ensure excellent readability with proper contrast ratio

Format feedback with beautiful HTML styling using warm colors and DARK TEXT for readability.`;

    try {
      const response = await this.askGemini({ prompt });
      
      // Try to parse JSON from the response
      let result;
      try {
        // Extract JSON from response if it's wrapped in text
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response.text;
        result = JSON.parse(jsonString);
      } catch {
        console.warn('Failed to parse AI evaluation response, providing fallback');
        // Fallback evaluation based on simple text analysis
        const isCorrect = correctAnswer ? 
          studentAnswer.toLowerCase().includes(correctAnswer.toLowerCase()) :
          studentAnswer.length > 10; // Basic heuristic
        
        result = {
          evaluation: {
            status: isCorrect ? 'PASS' : 'FAIL',
            score: isCorrect ? 85 : 45,
            feedback: `<div style="padding: 1rem; border-radius: 8px; ${isCorrect ? 'background: linear-gradient(135deg, #10b98120, #05966920); border-left: 4px solid #10b981;' : 'background: linear-gradient(135deg, #f59e0b20, #d97706020); border-left: 4px solid #f59e0b;'}"><strong style="color: ${isCorrect ? '#059669' : '#d97706'};">${isCorrect ? '✅ Good effort!' : '💡 Let\'s work on this together!'}</strong><br><p style="margin: 0.5rem 0 0 0; color: #374151;">${isCorrect ? 'You\'re on the right track!' : 'I can help you understand this concept better.'}</p></div>`,
            conceptsToReview: [context?.lessonTopic || 'number systems'],
            nextAction: isCorrect ? 'PROCEED' : 'TUTOR'
          }
        };
      }
      
      return result;
    } catch (error) {
      console.error('AI evaluation error:', error);
      throw error;
    }
  }

  /**
   * Generate next tutoring question based on student's progress
   */
  async generateTutoringQuestion(
    targetConcept: string,
    previousQuestions: string[],
    studentResponses: string[],
    questionType: 'leading' | 'conceptual' | 'verification' = 'leading'
  ): Promise<GeminiResponse> {
    const prompt = `You are an AI tutor helping a student understand "${targetConcept}". 

PREVIOUS QUESTIONS ASKED: ${previousQuestions.join('; ')}
STUDENT RESPONSES: ${studentResponses.join('; ')}

Generate a ${questionType} question that will help the student build understanding step by step.

- LEADING questions: Guide student toward discovery
- CONCEPTUAL questions: Test understanding of core ideas  
- VERIFICATION questions: Confirm they've grasped the concept

Format your response with HTML and inline CSS for beautiful display:
- Use <h4 style="color: #667eea; margin-bottom: 0.75rem; font-weight: 600;">🎯 Let's explore this together:</h4>
- <p style="color: #374151; margin-bottom: 0.75rem; line-height: 1.5;">Use engaging examples and analogies</p>
- <div style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin: 0.5rem 0; color: #374151; border-left: 3px solid #667eea;">Include helpful hints if needed</div>
- Make it encouraging and interactive with proper dark text colors

Provide just the question, not the answer.`;

    return this.askGemini({ prompt });
  }

  /**
   * Evaluate tutoring session progress and determine if student is ready to proceed
   */
  async evaluateTutoringProgress(
    originalQuestion: string,
    tutoringQuestions: string[],
    studentResponses: string[],
    targetConcepts: string[]
  ): Promise<{
    isReadyToProceed: boolean;
    confidenceLevel: number;
    feedback: string;
    recommendedAction: 'PROCEED' | 'CONTINUE_TUTORING' | 'RETRY_ORIGINAL';
  }> {
    const prompt = `Evaluate a student's progress through AI tutoring.

ORIGINAL QUESTION: "${originalQuestion}"
TARGET CONCEPTS: ${targetConcepts.join(', ')}
TUTORING QUESTIONS: ${tutoringQuestions.join('; ')}
STUDENT RESPONSES: ${studentResponses.join('; ')}

Respond with JSON:
{
  "isReadyToProceed": boolean,
  "confidenceLevel": number_0_to_100,
  "feedback": "HTML-formatted encouraging message",
  "recommendedAction": "PROCEED" | "CONTINUE_TUTORING" | "RETRY_ORIGINAL"
}

CRITERIA:
- PROCEED: Student shows solid understanding (80%+ confidence)
- CONTINUE_TUTORING: Some progress but needs more practice (40-79%)
- RETRY_ORIGINAL: Student ready to retry the original question (60%+)`;

    try {
      const response = await this.askGemini({ prompt });
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response.text;
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Tutoring evaluation error:', error);
      // Fallback assessment
      return {
        isReadyToProceed: studentResponses.length >= 2,
        confidenceLevel: Math.min(studentResponses.length * 30, 80),
        feedback: '<div style="padding: 1rem; background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 8px;"><strong style="color: #667eea;">🎓 Great progress!</strong><br><p style="color: #374151; margin: 0.5rem 0 0 0;">You\'re building understanding step by step.</p></div>',
        recommendedAction: studentResponses.length >= 3 ? 'PROCEED' : 'CONTINUE_TUTORING'
      };
    }
  }

  /**
   * Generate conversation summary from messages
   */
  async summarizeConversation(
    messages: Array<{ role: 'bot' | 'student'; text: string; timestamp: Date }>,
    currentStep?: { id: string; topic: string },
    existingSummary?: string
  ): Promise<{
    summary: string;
    keyTopics: string[];
    studentProgress: {
      currentStep: string;
      completedSteps: string[];
      strugglingAreas: string[];
      strengths: string[];
    };
    conversationHighlights: string[];
  }> {
    const prompt = `You are an intelligent conversation summarizer for an educational AI tutor.

MESSAGES TO SUMMARIZE:
${messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')}

${existingSummary ? `EXISTING SUMMARY: ${existingSummary}` : ''}
${currentStep ? `CURRENT LESSON STEP: ${currentStep.id} (Topic: ${currentStep.topic})` : ''}

Create a comprehensive summary for future AI calls. Respond with JSON:

{
  "summary": "Natural language summary of the conversation including key learnings, student progress, and important context",
  "keyTopics": ["array of main topics discussed"],
  "studentProgress": {
    "currentStep": "current lesson step ID",
    "completedSteps": ["array of completed step IDs"],
    "strugglingAreas": ["concepts student finds difficult"],
    "strengths": ["areas where student excels"]
  },
  "conversationHighlights": ["important moments or breakthroughs in the conversation"]
}

Focus on:
- Learning progress and understanding levels
- Questions student asked
- Areas of confusion or mastery
- Teaching approaches that worked well
- Context that would help future AI responses`;

    try {
      const response = await this.askGemini({ prompt });
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response.text;
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Conversation summarization error:', error);
      // Fallback summary
      return {
        summary: `Conversation with ${messages.length} messages about ${currentStep?.topic || 'number systems'}. Student is actively engaged in learning.`,
        keyTopics: [currentStep?.topic || 'number systems'],
        studentProgress: {
          currentStep: currentStep?.id || 'unknown',
          completedSteps: [],
          strugglingAreas: [],
          strengths: ['engagement']
        },
        conversationHighlights: ['Active participation in lesson']
      };
    }
  }

  /**
   * Evaluate answer with full conversation context
   */
  async evaluateAnswerWithContext(
    question: string,
    studentAnswer: string,
    correctAnswer: string | undefined,
    conversationContext: {
      summary: string;
      recentMessages: Array<{ role: string; text: string }>;
      studentProgress: {
        strugglingAreas: string[];
        strengths: string[];
      };
    },
    context?: {
      stepId: string;
      lessonTopic: string;
      previousAttempts?: string[];
    }
  ): Promise<{
    evaluation: {
      status: 'PASS' | 'FAIL';
      score: number;
      feedback: string;
      conceptsToReview?: string[];
      nextAction: 'PROCEED' | 'TUTOR' | 'RETRY';
    };
    tutoringPlan?: {
      targetConcepts: string[];
      questions: Array<{
        id: string;
        type: 'leading' | 'conceptual' | 'verification';
        prompt: string;
        expectedAnswer?: string;
        hints?: string[];
      }>;
      approachType: 'guided' | 'conceptual' | 'practical';
      estimatedDuration: number;
    };
  }> {
    const prompt = `You are an intelligent tutoring system with full conversation context.

QUESTION: "${question}"
STUDENT ANSWER: "${studentAnswer}"
${correctAnswer ? `EXPECTED ANSWER: "${correctAnswer}"` : ''}

CONVERSATION CONTEXT:
Summary: ${conversationContext.summary}
Student's Known Strengths: ${conversationContext.studentProgress.strengths.join(', ')}
Student's Struggling Areas: ${conversationContext.studentProgress.strugglingAreas.join(', ')}

Recent Messages:
${conversationContext.recentMessages.map(m => `${m.role}: ${m.text}`).join('\n')}

${context?.lessonTopic ? `LESSON TOPIC: ${context.lessonTopic}` : ''}
${context?.previousAttempts ? `PREVIOUS ATTEMPTS: ${context.previousAttempts.join(', ')}` : ''}

Evaluate this answer considering the full conversation history and student's learning journey. Respond with JSON:

{
  "evaluation": {
    "status": "PASS" or "FAIL",
    "score": number_0_to_100,
    "feedback": "HTML-formatted feedback that acknowledges their learning journey with DARK TEXT for readability",
    "conceptsToReview": ["specific concepts to review based on conversation history"],
    "nextAction": "PROCEED", "TUTOR", or "RETRY"
  },
  "tutoringPlan": {
    "targetConcepts": ["concepts tailored to their learning history"],
    "questions": [
      {
        "id": "unique_id",
        "type": "leading", "conceptual", or "verification",
        "prompt": "question that builds on their conversation history",
        "expectedAnswer": "expected response",
        "hints": ["hints that reference their past learning"]
      }
    ],
    "approachType": "guided", "conceptual", or "practical",
    "estimatedDuration": number_in_minutes
  }
}

CRITICAL COLOR CONTRAST RULES for HTML formatting:
- ALWAYS use dark text colors: #374151, #1f2937, or #4b5563 for main text
- NEVER use white (#ffffff) or light colors for text content
- Use light backgrounds (#f9fafb, #f3f4f6) with dark text only
- Example: <p style="color: #374151;">Your readable text here</p>
- For emphasis: <strong style="color: #059669;">emphasized text</strong>
- Ensure excellent readability with proper contrast ratio

Consider their previous questions, struggles, and successes when crafting feedback and tutoring plans.`;

    try {
      const response = await this.askGemini({ prompt });
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response.text;
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Context-aware evaluation error:', error);
      // Fallback to regular evaluation without context
      return this.evaluateAnswer(question, studentAnswer, correctAnswer, context);
    }
  }

  /**
   * Answer student question with conversation context
   */
  async answerQuestionWithContext(
    question: string,
    conversationContext: {
      summary: string;
      recentMessages: Array<{ role: string; text: string }>;
      currentStep: { id: string; topic: string };
    }
  ): Promise<GeminiResponse> {
    const prompt = `Hey there, my curious friend! 🌟 You just asked me: "${question}" - and I'm so excited to help you with this!

Let me tell you what's been happening in our learning journey together:
Our Conversation So Far: ${conversationContext.summary}
What We're Exploring Now: ${conversationContext.currentStep.topic} (Step: ${conversationContext.currentStep.id})

Our Recent Chats:
${conversationContext.recentMessages.map(m => `${m.role}: ${m.text}`).join('\n')}

You know what I love about your question? It shows you're connecting the dots and really thinking! That's exactly what great learners do. 💡

Let me answer this in a way that builds on everything we've discovered together:

1. I'll connect this to what you already know 🔗
2. Reference our previous conversations naturally 🗨️
3. Build on your current understanding level 🏗️
4. Show you how this fits into the bigger picture 🌍
5. Encourage you to keep exploring! 🚀

IMPORTANT: Format this like you're having an exciting conversation with a friend:
- <h3 style="color: #667eea; margin-bottom: 1rem; font-weight: 700; font-size: 1.25rem; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">📚 Amazing question! Here's what's so cool about this...</h3>
- <p style="margin-bottom: 1rem; line-height: 1.6; color: #374151; font-size: 1rem;">warm, personal explanations that reference our journey</p>
- <strong style="color: #059669; font-weight: 600;">insights that connect to their learning</strong>
- <div style="background: linear-gradient(135deg, #667eea20, #764ba220); padding: 1.5rem; border-radius: 12px; margin: 1rem 0; color: #374151; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1); border-left: 4px solid #667eea;"><strong style="color: #667eea; font-size: 1.1rem;">💡 Building on what you know</strong><br><span style="color: #374151; line-height: 1.5; margin-top: 0.5rem; display: inline-block;">examples that build on what they already know</span></div>
- <ul style="margin: 1rem 0; padding-left: 1.5rem; color: #374151;"><li style="margin-bottom: 0.75rem; color: #374151; line-height: 1.5;">list items with dark text</li></ul>
- Use emojis to keep it engaging and personal

CRITICAL COLOR CONTRAST RULES:
- ALWAYS use dark text colors: #374151, #1f2937, or #4b5563 for ALL text content
- NEVER use white (#ffffff) or light colors for main text
- Ensure excellent readability on light backgrounds
- Example: <p style="color: #374151;">Your readable content</p>
- All div content: <div style="color: #374151;">content with dark text</div>

ENHANCED STYLING SPECIFICATIONS:
- Professional spacing: margin-bottom: 1rem, padding: 1.5rem
- Visual depth: box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1)
- Modern borders: border-radius: 12px, border-left: 4px solid for accents
- Typography: line-height: 1.5-1.6, font-weight: 600-700 for emphasis
- Subtle effects: text-shadow: 0 1px 2px rgba(0,0,0,0.1) for headings

Make sure to naturally reference their learning history and build on what they already understand! 🎆`;

    return this.askGemini({ prompt });
  }

  /**
   * Health check for API connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Create and export singleton instance
export const geminiClient = new GeminiClient();

// Export utility functions for common use cases
export const askGemini = (prompt: string, context?: GeminiRequest['context']) => 
  geminiClient.askGemini({ prompt, context });

export const explainConcept = (concept: string, context?: { studentLevel?: string; previousContent?: string }) =>
  geminiClient.explainConcept(concept, context);

export const provideFeedback = (answer: string, correctAnswer?: string, isCorrect?: boolean) =>
  geminiClient.provideFeedback(answer, correctAnswer, isCorrect);

export const generateHint = (question: string, previousAttempts: string[]) =>
  geminiClient.generateHint(question, previousAttempts);

export const answerQuestion = (question: string, lessonContext?: string) =>
  geminiClient.answerQuestion(question, lessonContext);

export default geminiClient;