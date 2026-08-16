import { initRouter } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  // Register Service Worker for PWA / Offline functionality
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => console.log('Service Worker Registered Successfully.'))
      .catch((err) => console.error('Service Worker Registration Failed:', err));
  }

  // Initialize Dark Mode
  initDarkMode();

  // Initialize Application Router
  initRouter();
});

function initDarkMode() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem('learnpware_theme') || 'light';

  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggleBtn.textContent = '☀️ Light';
  } else {
    document.documentElement.removeAttribute('data-theme');
    toggleBtn.textContent = '🌙 Dark';
  }

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('learnpware_theme', 'light');
      toggleBtn.textContent = '🌙 Dark';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('learnpware_theme', 'dark');
      toggleBtn.textContent = '☀️ Light';
    }
    // --- AUTO-UPDATE SERVICE WORKER LOGIC ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((registration) => {
      // Check for updates every time the app opens or gains focus
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Checks every hour (or adjust as needed)

      // Listen for a new service worker taking over
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // A new version is available! Prompt or auto-reload to update
            if (confirm('A new version of VoiLearn is available! Tap OK to update.')) {
              window.location.reload();
            }
          }
        });
      });
    }).catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  });

  // Ensure page reloads when the new service worker claims control
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      window.location.reload();
      refreshing = true;
    }
  });
}
  });
}