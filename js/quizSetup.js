import { renderQuiz } from './quiz.js';

export async function renderQuizSetup(container, subjectId) {
  try {
    const res = await fetch('data/questions.json');
    const allData = await res.json();
    const questions = allData[subjectId] || [];

    if (questions.length === 0) {
      container.innerHTML = `
        <div class="card">
          <h2>No Questions Found</h2>
          <p>There are no questions available for this subject yet.</p>
          <button onclick="window.location.hash='#home'">Back to Home</button>
        </div>
      `;
      return;
    }

    // Automatically detect unique question types present in this subject's dataset
    const availableTypes = [...new Set(questions.map(q => q.type))];

    // Format nice display labels for types
    const typeLabels = {
      'multiple-choice': 'Multiple Choice',
      'true-false': 'True or False',
      'identification': 'Identification',
      'enumeration': 'Enumeration & Listing'
    };

    container.innerHTML = `
      <div class="card" style="max-width: 500px; margin: 2rem auto;">
        <h2>Customize Your Quiz</h2>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Select what type of questions you want to practice for this module.</p>
        
        <label for="quizTypeSelect" style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Question Type:</label>
        <select id="quizTypeSelect" class="card" style="width: 100%; padding: 0.8rem; margin-bottom: 1.5rem; background: var(--bg-color); color: var(--text-main); border: 1px solid var(--border-color);">
          <option value="all">Mix All Types (${questions.length} Questions total)</option>
          ${availableTypes.map(type => `
            <option value="${type}">${typeLabels[type] || type} Only</option>
          `).join('')}
        </select>

        <div style="display: flex; gap: 1rem;">
          <button id="startCustomQuizBtn" style="flex: 1;">Start Quiz</button>
          <button onclick="window.location.hash='#home'" style="background: var(--border-color); color: var(--text-main);">Cancel</button>
        </div>
      </div>
    `;

    document.getElementById('startCustomQuizBtn').addEventListener('click', () => {
      const selectedType = document.getElementById('quizTypeSelect').value;
      
      // Pass the filtered subset of questions (or all) directly to your renderQuiz engine
      let filteredQuestions = questions;
      if (selectedType !== 'all') {
        filteredQuestions = questions.link ? questions : questions.filter(q => q.type === selectedType);
      }

      // Launch the actual quiz runner with the chosen filter
      renderQuiz(container, subjectId, filteredQuestions);
    });

  } catch (err) {
    console.error('Error loading quiz setup:', err);
    container.innerHTML = '<p>Failed to load quiz setup options.</p>';
  }
}