import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'

console.log('[main.tsx] Starting ClaudeDeck application...');

// Global error handler
window.addEventListener('error', (event) => {
  console.error('[main.tsx] Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[main.tsx] Unhandled promise rejection:', event.reason);
});

// Initialize React
try {
  const rootElement = document.getElementById('root');
  console.log('[main.tsx] Root element:', rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('[main.tsx] Creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('[main.tsx] Rendering App component...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('[main.tsx] React app rendered successfully');
} catch (error) {
  console.error('[main.tsx] Failed to start app:', error);
  
  // Display error visually if React fails to load
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: red; color: white; padding: 20px; z-index: 9999; font-family: monospace;';
  errorDiv.innerHTML = `
    <h2>React Initialization Error</h2>
    <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
    <pre>${error instanceof Error ? error.stack : 'No stack trace'}</pre>
  `;
  document.body.appendChild(errorDiv);
}