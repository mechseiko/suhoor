import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Clear any existing Service Workers to fix caching issues (Transitioning away from PWA to Capacitor)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

// Hard failsafe: remove splash screen after 3 seconds anyway
setTimeout(() => {
  const splash = document.getElementById('splash-screen');
  if (splash && !splash.classList.contains('fade-out')) {
    // console.log('Main.jsx failsafe: Hiding splash screen');
    splash.classList.add('fade-out');
    setTimeout(() => {
      // if (splash.parentNode) splash.remove();
    }, 600);
  }
}, 3000);

createRoot(document.getElementById('root')).render(
  <App />
)
