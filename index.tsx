import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Workaround for "TypeError: Cannot set property fetch of #<Window> which has only a getter"
// This error often happens when a library tries to polyfill fetch but window.fetch is read-only.
try {
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    if (originalFetch) {
      Object.defineProperty(window, 'fetch', {
        get() { return originalFetch; },
        set() { console.warn('Something tried to overwrite window.fetch. This was prevented.'); },
        configurable: true
      });
    }
  }
} catch (e) {
  console.warn('Could not protect window.fetch:', e);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
