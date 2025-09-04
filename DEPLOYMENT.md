# 🤖 Numbers Tutor AI - Deployment Guide

## 🚀 Deploy to Vercel

### Method 1: VS Code Extension (Recommended)
1. Install the [Vercel VS Code Extension](https://marketplace.visualstudio.com/items?itemName=vercel.vercel-vscode)
2. Open this project in VS Code
3. Open Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows)
4. Run `Vercel: Deploy`
5. Follow the prompts to connect your Vercel account
6. Set environment variables in Vercel dashboard

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# For production deployment
vercel --prod
```

### Method 3: GitHub Integration
1. Push code to GitHub repository
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Configure environment variables
4. Deploy automatically on every push

## 🔧 Environment Variables

Set these in your Vercel project dashboard:

```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

## 📦 Project Structure
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js serverless functions
- **AI**: Google Gemini API integration
- **Deployment**: Configured for Vercel

## 🛠️ Local Development
```bash
# Install dependencies
npm install

# Start frontend (http://localhost:5173)
npm run dev

# Start backend (http://localhost:3002)
npm run dev:server
```

## ✅ Deployment Checklist
- [x] vercel.json configuration
- [x] Build scripts optimized
- [x] Environment variables documented
- [x] API routes configured
- [x] Static files handling
- [x] TypeScript compilation

## 🔗 Live Demo
After deployment, your app will be available at:
- `https://your-project-name.vercel.app`

## 💡 Features
- 🎓 Interactive number systems learning
- 🤖 AI-powered tutoring with Gemini
- 📱 Responsive design for all devices
- 💬 Real-time chat interface
- 🎯 Progress tracking and evaluation