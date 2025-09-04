# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# 🧮 Numbers Tutor - Gemini-Powered Learning Bot

An interactive React application that teaches number systems through AI-powered conversations. Students learn about decimal, binary, and hexadecimal number systems through guided lessons, quizzes, and reflections powered by Google's Gemini AI.

## ✨ Features

- **Interactive Learning**: Conversational AI tutor powered by Gemini
- **Structured Lessons**: Step-by-step progression through number systems concepts
- **Multiple Question Types**: Multiple choice, open-ended, and reflection questions
- **Real-time Feedback**: AI-generated responses and encouragement
- **Progress Tracking**: Visual progress indicators and lesson completion tracking
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **State Persistence**: Lesson progress saved locally
- **Type-Safe**: Built with TypeScript for reliability

## 🏗️ Architecture

### Frontend Stack
- **React 19** - Modern UI library with latest features
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **Zustand** - Lightweight state management
- **XState** - State machine for conversation flow management

### Backend
- **Express.js** - API server and Gemini proxy
- **CORS** - Cross-origin resource sharing
- **Node.js** - JavaScript runtime

### AI Integration
- **Google Gemini AI** - Conversational AI responses
- **Secure Proxy** - Server-side API key management
- **Fallback Responses** - Mock responses for development

## 📁 Project Structure

```
src/
├── components/           # React UI components
│   ├── ChatPanel.tsx    # Main conversation interface
│   ├── MessageBubble.tsx # Individual chat messages
│   ├── LessonStepCard.tsx # Interactive lesson steps
│   ├── ProgressBar.tsx  # Progress tracking
│   └── ReflectionBox.tsx # Student reflection input
├── features/
│   ├── conversation/    # State management
│   │   └── useConversationStore.ts
│   ├── orchestrator/    # XState machine
│   │   └── useLessonMachine.ts
│   └── learning/        # Lesson configuration
│       └── lessonScript.ts
├── ai/
│   └── geminiClient.ts  # Gemini API integration
├── lib/
│   └── types.ts         # TypeScript definitions
├── App.tsx              # Main application component
└── main.tsx             # Application entry point

server/
└── index.ts             # Express server and Gemini proxy
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key (optional for development)

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd numbers-tutor-starter
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env and add your Gemini API key (optional)
   ```

3. **Start Development**:
   ```bash
   # Terminal 1: Start the backend server
   npm run dev:server
   
   # Terminal 2: Start the frontend
   npm run dev
   ```

4. **Open Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

## 🔧 Configuration

### Gemini API Setup

1. **Get API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env` file

2. **Environment Variables**:
   ```bash
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3001
   NODE_ENV=development
   ```

### Development Mode
- Without API key: Uses mock AI responses
- With API key: Real Gemini AI integration
- All core functionality works in both modes

## 🎯 Usage

### For Students
1. **Start Learning**: Open the application to begin
2. **Follow Conversations**: Read bot messages and respond thoughtfully
3. **Answer Questions**: Choose from multiple choice or type answers
4. **Reflect**: Share thoughts in reflection prompts
5. **Track Progress**: Monitor completion via progress bar
6. **Review**: Use navigation to revisit previous steps

### For Educators
1. **Customize Lessons**: Edit `src/features/learning/lessonScript.ts`
2. **Add Questions**: Extend lesson steps with new content
3. **Monitor Progress**: Check browser localStorage for student data
4. **Adjust Difficulty**: Modify prompts and explanations

## 🔧 Development

### Available Scripts

```
# Development
npm run dev          # Start frontend dev server
npm run dev:server   # Start backend dev server

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

### Adding New Lessons

1. **Create Lesson Steps**:
   ```typescript
   // In src/features/learning/lessonScript.ts
   const newLessonSteps: LessonStep[] = [
     {
       id: "step1",
       type: "bot",
       content: "Welcome to the new lesson!",
       nextStepId: "step2"
     },
     // ... more steps
   ];
   ```

2. **Update Lesson Config**:
   ```typescript
   export const newLessonConfig: LessonConfig = {
     id: "new_lesson",
     title: "New Lesson Title",
     description: "Lesson description",
     steps: newLessonSteps,
     estimatedDuration: 20
   };
   ```

### Custom Components

1. **Create Component**:
   ```typescript
   // src/components/CustomComponent.tsx
   import React from 'react';
   
   interface Props {
     // Define props
   }
   
   const CustomComponent: React.FC<Props> = ({ }) => {
     return (
       <div className="custom-component">
         {/* Component content */}
       </div>
     );
   }
   
   export default CustomComponent;
   ```

2. **Add Styling**:
   ```css
   /* In src/App.css */
   .custom-component {
     /* Add styles */
   }
   ```

## 🔐 Security

- **API Key Protection**: Gemini API key stored server-side only
- **CORS Configuration**: Restricted to development origins
- **Input Validation**: Server validates all API requests
- **Safe Defaults**: Graceful fallbacks for API failures

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. **Build**: `npm run build`
2. **Deploy**: Upload `dist/` folder
3. **Environment**: Set `VITE_API_URL` if needed

### Backend (Railway/Heroku)
1. **Prepare**: Ensure `server/index.ts` is configured
2. **Environment**: Set `GEMINI_API_KEY` and `PORT`
3. **Deploy**: Push to platform

### Full Stack (Docker)
```
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build
EXPOSE 3001
CMD [\"npm\", \"run\", \"start:server\"]\n```

## 🧪 Testing

### Manual Testing
1. **Start Application**: Follow quick start steps
2. **Test Conversation Flow**: Complete a full lesson
3. **Test Responsiveness**: Check mobile/tablet views
4. **Test API Integration**: Verify Gemini responses

### Automated Testing (Future)
- Unit tests for components
- Integration tests for state management
- E2E tests for user flows

## 📋 Roadmap

### Phase 1 (Current)
- ✅ Basic conversation flow
- ✅ Question types and feedback
- ✅ Progress tracking
- ✅ Responsive design

### Phase 2 (Next)
- [ ] Multiple lesson support
- [ ] Student profiles and analytics
- [ ] Voice input/output
- [ ] Advanced AI conversations

### Phase 3 (Future)
- [ ] Teacher dashboard
- [ ] Lesson editor
- [ ] Multi-language support
- [ ] Learning analytics

## 🤝 Contributing

1. **Fork Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript strict mode
- Use meaningful commit messages
- Add JSDoc comments for functions
- Maintain responsive design
- Test thoroughly before submitting

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Google Gemini AI** - Conversational AI capabilities
- **React Team** - Amazing frontend framework
- **XState** - Powerful state machine management
- **Vite** - Lightning-fast build tool

## 📞 Support

- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Email**: [Your contact email]

---
**Happy Learning! 🚀**

*Built with ❤️ for educational innovation*
