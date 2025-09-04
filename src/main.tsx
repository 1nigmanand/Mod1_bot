import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('🚀 main.tsx loading...');

try {
  const rootElement = document.getElementById('root');
  console.log('📍 Root element:', rootElement);
  
  if (!rootElement) {
    console.error('❌ Root element not found!');
    throw new Error('Root element not found');
  }
  
  console.log('✅ Creating React root...');
  const root = createRoot(rootElement);
  
  console.log('🎯 Rendering App...');
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  
  console.log('🎉 React render complete!');
} catch (error) {
  console.error('🚨 Error in main.tsx:', error);
  
  // Fallback rendering
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 2rem; background: red; color: white; font-family: Arial;">
        <h1>Critical Error</h1>
        <p>Failed to mount React app: ${error}</p>
        <button onclick="window.location.reload()">Reload Page</button>
      </div>
    `;
  }
}
