import { renderHome } from './lesson.js';
import { renderNotes } from './notes.js';
import { renderProgress } from './progress.js';
import { renderQuizSetup } from './quizSetup.js';

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('load', handleRoute);

  // Setup click handlers for nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      // Allow default hash change behavior
    });
  });
}

function handleRoute() {
  const hash = window.location.hash.substring(1) || 'home';
  const container = document.getElementById('app-container');
  container.innerHTML = '';

  const routeParts = hash.split('/');
  const baseRoute = routeParts[0];

  switch(baseRoute) {
    case 'home':
      renderHome(container);
      break;
    case 'lesson':
      import('./lesson.js').then(module => module.renderLesson(container, routeParts[1]));
      break;
    case 'quiz':
      // Updated to load the setup/filter screen first
      renderQuizSetup(container, routeParts[1]);
      break;
    case 'notes':
      // Passes the optional subject ID (e.g. #notes/js-basics -> routeParts[1] is 'js-basics')
      renderNotes(container, routeParts[1]);
      break;
    case 'progress':
      renderProgress(container);
      break;
    default:
      container.innerHTML = '<h2>404 - Page Not Found</h2>';
  }
}