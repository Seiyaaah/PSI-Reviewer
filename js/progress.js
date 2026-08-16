import { getProgress } from './storage.js';

export function renderProgress(container) {
  const progressData = getProgress();

  container.innerHTML = `
    <div class="card">
      <h2>Your Learning Progress</h2>
      ${Object.keys(progressData).length === 0 ? 
        '<p style="margin-top: 1rem;">No quizzes attempted yet. Complete a quiz to track your progress!</p>' : 
        `<ul style="margin-top: 1rem; padding-left: 1.5rem; display: grid; gap: 0.5rem;">
          ${Object.entries(progressData).map(([sub, data]) => `
            <li><strong>Subject ID: ${sub}</strong> — Score: ${data.score} / ${data.total}</li>
          `).join('')}
         </ul>`
      }
    </div>
  `;
}