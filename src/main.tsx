import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite WebSocket errors in the console
if (typeof window !== 'undefined') {
  const showMobileError = (title: string, detail: unknown) => {
    const root = document.getElementById('root');
    if (!root || root.childElementCount > 0) return;

    const message = detail instanceof Error
      ? `${detail.name}: ${detail.message}`
      : typeof detail === 'string'
        ? detail
        : JSON.stringify(detail);

    root.innerHTML = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; min-height: 100vh; background: #f4f7f7; color: #102f2f;">
        <div style="border-radius: 24px; background: white; border: 1px solid rgba(255,255,255,.8); box-shadow: 0 18px 38px rgba(15,23,42,.12); padding: 18px;">
          <div style="font-size: 12px; font-weight: 900; letter-spacing: .14em; color: #ef4444; text-transform: uppercase;">Mobile debug</div>
          <h1 style="font-size: 22px; line-height: 1.1; margin: 8px 0 10px; font-weight: 900;">${title}</h1>
          <pre style="white-space: pre-wrap; word-break: break-word; font-size: 12px; line-height: 1.45; color: #475569; margin: 0;">${message || 'Unknown error'}</pre>
        </div>
      </div>
    `;
  };

  window.addEventListener('error', (event) => {
    showMobileError('JavaScript error before render', event.error || event.message);
  });

  const originalError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('[vite] failed to connect to websocket')) {
      return;
    }
    originalError.apply(console, args);
  };
  
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('WebSocket closed without opened')) {
      event.preventDefault();
      return;
    }
    showMobileError('Unhandled promise rejection', event.reason);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
