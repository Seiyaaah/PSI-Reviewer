import { saveProgress } from './storage.js';

export async function renderQuiz(container, subjectId, customQuestions = null) {
  try {
    let questions = customQuestions;

    // If no pre-filtered questions were passed, fetch them directly
    if (!questions) {
      const res = await fetch('data/questions.json');
      const allQuestions = await res.json();
      questions = allQuestions[subjectId] || [];
    }

    if (questions.length === 0) {
      container.innerHTML = '<div class="card"><h2>No Questions Match This Filter</h2><button onclick="window.location.reload()">Try Again</button></div>';
      return;
    }

    let currentQ = 0;
    let score = 0;

    const showQuestion = () => {
      if (currentQ >= questions.length) {
        saveProgress(subjectId, score, questions.length);
        container.innerHTML = `
          <div class="card" style="text-align: center;">
            <h2>Quiz Completed! 🎉</h2>
            <p style="font-size: 1.2rem; margin: 1rem 0;">Your Score: ${score} / ${questions.length}</p>
            <button onclick="window.location.hash='#progress'">View Progress</button>
          </div>
        `;
        return;
      }

      const q = questions[currentQ];

      // Render inputs based on question type
      let inputHtml = '';
      if (q.type === 'identification') {
        inputHtml = `
          <div style="margin: 1.5rem 0;">
            <input type="text" id="ansInput" placeholder="Type your answer here..." class="card" style="width:100%; padding:0.8rem; font-size:1rem; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main); border-radius:6px; margin-bottom:1rem;">
            <button id="submitBtn">Submit Answer</button>
          </div>
        `;
      } else if (q.type === 'enumeration') {
        inputHtml = `
          <div style="margin: 1.5rem 0;">
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem;">Separate items with commas or new lines:</p>
            <textarea id="ansInput" rows="4" placeholder="Item 1, Item 2, Item 3..." class="card" style="width:100%; padding:0.8rem; font-size:1rem; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main); border-radius:6px; margin-bottom:1rem; resize:vertical;"></textarea>
            <button id="submitBtn">Submit Answer</button>
          </div>
        `;
      } else {
        inputHtml = `
          <div style="display: grid; gap: 0.5rem; margin-top: 1rem;">
            ${q.options.map((opt, idx) => `
              <button class="opt-btn" data-index="${idx}">${opt}</button>
            `).join('')}
          </div>
        `;
      }

      container.innerHTML = `
        <div class="card">
          <div style="display:flex; justify-content:space-between; color:var(--text-muted); font-size:0.9rem; margin-bottom:0.5rem;">
            <span>Type: ${q.type.toUpperCase()}</span>
            <span>Question ${currentQ + 1} of ${questions.length}</span>
          </div>
          <h3>${q.question}</h3>
          ${inputHtml}
          <div id="feedback-area" style="margin-top: 1rem;"></div>
        </div>
      `;

      // Evaluation and Feedback Logic
      const evaluateAndShowFeedback = (userAnswer) => {
        let isCorrect = false;

        if (q.type === 'identification') {
          const cleanedUser = String(userAnswer).trim().toLowerCase();
          const cleanedCorrect = String(q.answer).trim().toLowerCase();
          isCorrect = (cleanedUser === cleanedCorrect);
        } 
        else if (q.type === 'enumeration') {
          const userItems = String(userAnswer)
            .split(/[\n,;]+/)
            .map(item => item.trim().toLowerCase())
            .filter(item => item.length > 0);

          const correctItems = q.answer.map(item => String(item).trim().toLowerCase());
          isCorrect = correctItems.every(reqItem => userItems.includes(reqItem)) && userItems.length >= correctItems.length;
        } 
        else {
          isCorrect = (userAnswer === q.answer);
        }

        if (isCorrect) score++;

        // Disable all inputs/buttons so the user can't change answer after submitting
        if (q.type === 'identification' || q.type === 'enumeration') {
          document.getElementById('submitBtn').disabled = true;
          document.getElementById('ansInput').disabled = true;
        } else {
          container.querySelectorAll('.opt-btn').forEach(btn => btn.disabled = true);
        }

        // Show instant visual feedback
        const feedbackArea = document.getElementById('feedback-area');
        if (isCorrect) {
          feedbackArea.innerHTML = `
            <div style="background-color: #d4edda; color: #155724; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem;">
              <strong>✓ Correct!</strong> Great job.
            </div>
            <button id="nextBtn" style="background: #28a745; color: white;">Next Question →</button>
          `;
        } else {
          let correctText = q.type === 'multiple-choice' || q.type === 'true-false' 
            ? q.options[q.answer] 
            : Array.isArray(q.answer) ? q.answer.join(', ') : q.answer;

          feedbackArea.innerHTML = `
            <div style="background-color: #f8d7da; color: #721c24; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem;">
              <strong>✗ Incorrect.</strong> The correct answer was: <em>${correctText}</em>
            </div>
            <button id="nextBtn" style="background: var(--text-muted); color: white;">Next Question →</button>
          `;
        }

        // Proceed to next question when clicking the generated Next button
        document.getElementById('nextBtn').addEventListener('click', () => {
          currentQ++;
          showQuestion();
        });
      };

      // Event Binding
      if (q.type === 'identification' || q.type === 'enumeration') {
        const submitBtn = document.getElementById('submitBtn');
        const textInput = document.getElementById('ansInput');

        const handleSubmission = () => {
          const val = textInput.value;
          if (!val.trim()) {
            alert('Please provide an answer!');
            return;
          }
          evaluateAndShowFeedback(val);
        };

        submitBtn.addEventListener('click', handleSubmission);
        textInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && q.type === 'identification') handleSubmission();
        });
      } else {
        container.querySelectorAll('.opt-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const selected = parseInt(e.target.getAttribute('data-index'));
            evaluateAndShowFeedback(selected);
          });
        });
      }
    };

    showQuestion();
  } catch (err) {
    console.error('Quiz loading error:', err);
    container.innerHTML = '<p>Failed to load quiz content.</p>';
  }
}