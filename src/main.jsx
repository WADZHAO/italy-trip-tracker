import React from 'react';
import ReactDOM from 'react-dom/client';
import ItalyTripTracker from './components/ItalyTripTracker';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ItalyTripTracker />
  </React.StrictMode>
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
