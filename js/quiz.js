import { saveProgress } from './storage.js';

// Helper function for flexible string matching
function isFlexibleMatch(userAnswer, correctAnswer) {
  const clean = (str) => {
    return String(str)
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const cleanedUser = clean(userAnswer);
  const cleanedCorrect = clean(correctAnswer);

  if (cleanedUser === cleanedCorrect) return true;

  if (cleanedCorrect.length > 4 && cleanedUser.includes(cleanedCorrect)) {
    return true;
  }

  return false;
}

// Fisher-Yates Shuffle Algorithm to randomize an array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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

    // --- SHUFFLE QUESTIONS SO THEY ARE NEVER IN THE SAME PATTERN ---
    questions = shuffleArray(questions);

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
      } else if (q.type === 'modified-true-false') {
        inputHtml = `
          <div style="margin: 1.5rem 0;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
              <label style="cursor: pointer;"><input type="radio" name="mtf-choice" value="True" style="margin-right: 5px;"> True</label>
              <label style="cursor: pointer;"><input type="radio" name="mtf-choice" value="False" style="margin-right: 5px;"> False</label>
            </div>
            <div id="correction-container" style="margin-bottom: 1rem;">
              <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem;">If False, type the correction:</p>
              <input type="text" id="mtfCorrection" placeholder="Enter correction..." class="card" style="width:100%; padding:0.8rem; font-size:1rem; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main); border-radius:6px;">
            </div>
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
          isCorrect = isFlexibleMatch(userAnswer, q.answer);
        } 
        else if (q.type === 'enumeration') {
          const userItems = String(userAnswer)
            .split(/[\n,;]+/)
            .map(item => item.trim())
            .filter(item => item.length > 0);

          const correctItems = q.answer.map(item => String(item).trim());
          isCorrect = correctItems.every(reqItem => 
            userItems.some(userItem => isFlexibleMatch(userItem, reqItem))
          ) && userItems.length >= correctItems.length;
        } 
        else if (q.type === 'modified-true-false') {
          const selectedRadio = document.querySelector('input[name="mtf-choice"]:checked');
          if (!selectedRadio) {
            alert('Please select True or False!');
            return false;
          }
          const userChoice = selectedRadio.value; 
          const userCorrection = document.getElementById('mtfCorrection').value;
          
          const expectedAnswer = String(q.answer); 
          const expectedCorrection = String(q.correction || "");

          if (userChoice === expectedAnswer) {
            if (expectedAnswer === "True") {
              isCorrect = true;
            } else {
              isCorrect = isFlexibleMatch(userCorrection, expectedCorrection);
            }
          } else {
            isCorrect = false;
          }
        }
        else {
          isCorrect = (userAnswer === q.answer);
        }

        if (isCorrect) score++;

        // Disable all inputs/buttons so the user can't change answer after submitting
        if (q.type === 'identification' || q.type === 'enumeration') {
          document.getElementById('submitBtn').disabled = true;
          document.getElementById('ansInput').disabled = true;
        } else if (q.type === 'modified-true-false') {
          document.getElementById('submitBtn').disabled = true;
          document.querySelectorAll('input[name="mtf-choice"]').forEach(r => r.disabled = true);
          document.getElementById('mtfCorrection').disabled = true;
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
          let correctText = '';
          if (q.type === 'multiple-choice' || q.type === 'true-false') {
            correctText = q.options[q.answer];
          } else if (q.type === 'modified-true-false') {
            correctText = `${q.answer}${q.answer === 'False' ? ` (Correction: ${q.correction})` : ''}`;
          } else if (Array.isArray(q.answer)) {
            correctText = q.answer.join(', ');
          } else {
            correctText = q.answer;
          }

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

        return true;
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
      } else if (q.type === 'modified-true-false') {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.addEventListener('click', () => {
          evaluateAndShowFeedback();
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
