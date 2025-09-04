import type { LessonConfig, LessonStep } from '../../lib/types';

// Sample lesson steps for number systems learning
export const lessonSteps: LessonStep[] = [
  {
    id: "welcome",
    type: "bot",
    content: "Namaste, learner! 🙏 Welcome to our journey through the fascinating world of number systems. I'm your guide today, and together we'll explore how humans have counted and calculated throughout history. Feel free to ask me any questions along the way!",
    nextStepId: "intro_question"
  },
  {
    id: "intro_question",
    type: "question",
    content: "Imagine you're in a village 5000 years ago, before any written numbers existed. You need to count your sheep. What would you naturally use to keep track?",
    prompt: "How would ancient people count without written numbers?",
    options: [
      "Their fingers and toes",
      "Sticks and stones",
      "Lines carved in wood or stone",
      "All of the above"
    ],
    answer: "All of the above",
    nextStepId: "counting_reflection"
  },
  {
    id: "counting_reflection",
    type: "reflection",
    content: "Excellent thinking! Humans have always been creative with counting. Let's reflect on this:",
    prompt: "Can you think of any number system you've seen apart from our usual decimal (base-10) system? Maybe in computers, clocks, or other areas of life?",
    nextStepId: "binary_intro"
  },
  {
    id: "binary_intro",
    type: "bot",
    content: "Great observations! You might have mentioned binary (computers), base-60 (time), or even base-12 (dozens). Today we'll focus on binary - the language of computers. Every message, photo, and video is just 1s and 0s! Have any questions about how this works?",
    nextStepId: "binary_explanation"
  },
  {
    id: "binary_explanation",
    type: "bot",
    content: "In decimal, we use 10 digits (0-9) and each position represents a power of 10. In binary, we use only 2 digits (0, 1) and each position represents a power of 2. Let's convert the decimal number 5 to binary. We break it down: 5 = 4 + 1 = 2² + 2⁰ = 101 in binary. Can you see the pattern?",
    nextStepId: "binary_quiz1"
  },
  {
    id: "binary_quiz1",
    type: "quiz",
    content: "Let's test your understanding!",
    prompt: "What is the decimal number 8 in binary?",
    options: ["1000", "1001", "1010", "1100"],
    answer: "1000",
    nextStepId: "binary_quiz2"
  },
  {
    id: "binary_quiz2",
    type: "quiz",
    content: "One more quick check:",
    prompt: "What base is the binary number system?",
    answer: "2",
    nextStepId: "practical_reflection"
  },
  {
    id: "practical_reflection",
    type: "reflection",
    content: "Wonderful! You're getting the hang of this. Binary is everywhere in our digital world.",
    prompt: "Now think about this: Why do you think computers use binary instead of decimal like humans do? What advantages might this have?",
    nextStepId: "hexadecimal_intro"
  },
  {
    id: "hexadecimal_intro",
    type: "bot",
    content: "Excellent reasoning! Computers use binary because it's simple - each bit is either ON (1) or OFF (0), like a light switch. But binary numbers get very long, so programmers often use hexadecimal (base-16) as a shorthand.",
    nextStepId: "hex_explanation"
  },
  {
    id: "hex_explanation",
    type: "bot",
    content: "Hexadecimal uses 16 symbols: 0-9 and A-F (where A=10, B=11, C=12, D=13, E=14, F=15). One hex digit represents exactly 4 binary digits! For example: Binary 1111 = Decimal 15 = Hex F. And Binary 1010 = Decimal 10 = Hex A. See how much shorter hex is?",
    nextStepId: "hex_quiz"
  },
  {
    id: "hex_quiz",
    type: "quiz",
    content: "Let's practice hex conversion:",
    prompt: "What is the hexadecimal representation of decimal 255?",
    options: ["FF", "FE", "F0", "EF"],
    answer: "FF",
    nextStepId: "final_reflection"
  },
  {
    id: "final_reflection",
    type: "reflection",
    content: "Amazing work! You've learned about different number systems that power our digital world.",
    prompt: "Take a moment to reflect: How has learning about different number systems changed your perspective on mathematics or technology? What was the most surprising thing you learned today?",
    nextStepId: "conclusion"
  },
  {
    id: "conclusion",
    type: "bot",
    content: "🎉 Congratulations! You've completed your journey through number systems. From ancient counting methods to modern binary and hexadecimal, you now understand the foundation of all digital technology. Keep exploring, keep questioning, and remember - every complex system started with simple ideas like counting on fingers! 🌟"
  }
];

// Main lesson configuration
export const lessonConfig: LessonConfig = {
  id: "number_systems_intro",
  title: "Journey Through Number Systems",
  description: "An interactive exploration of how humans count and how computers think, from ancient methods to modern binary and hexadecimal systems.",
  steps: lessonSteps,
  estimatedDuration: 25 // minutes
};

// Helper functions for lesson navigation
export const findStepById = (id: string): LessonStep | undefined => {
  return lessonSteps.find(step => step.id === id);
};

export const getNextStep = (currentStepId: string): LessonStep | null => {
  const currentStep = findStepById(currentStepId);
  if (!currentStep || !currentStep.nextStepId) {
    return null;
  }
  return findStepById(currentStep.nextStepId) || null;
};

export const getStepIndex = (stepId: string): number => {
  return lessonSteps.findIndex(step => step.id === stepId);
};

export const getTotalSteps = (): number => {
  return lessonSteps.length;
};

export const isLastStep = (stepId: string): boolean => {
  const step = findStepById(stepId);
  return step ? !step.nextStepId : false;
};

// Additional lesson configurations can be added here
export const availableLessons: LessonConfig[] = [
  lessonConfig,
  // Future lessons can be added here
  // logicGatesLesson,
  // algorithmBasicsLesson,
  // etc.
];