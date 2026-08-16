export async function renderHome(container) {
  try {
    const res = await fetch('data/subjects.json');
    const subjects = await res.json();

    container.innerHTML = `
      <h2>Explore Subjects</h2>
      <p>Select a subject to start learning.</p>
      <div class="subjects-grid" style="margin-top: 1rem; display: grid; gap: 1rem;">
        ${subjects.map(sub => `
          <div class="card">
            <h3>${sub.title}</h3>
            <p>${sub.description}</p>
            <button onclick="window.location.hash='#lesson/${sub.id}'" style="margin-top: 1rem;">Start Subject</button>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = '<p>Failed to load subjects. Check your offline connection.</p>';
  }
}

export async function renderLesson(container, subjectId) {
  try {
    const res = await fetch('data/lessons.json');
    const lessonsData = await res.json();
    const lesson = lessonsData[subjectId] || { title: "Lesson Not Found", content: "Content coming soon." };

    // Helper to format plain text smoothly if it lacks HTML tags
    const formatContent = (text) => {
      if (text.includes('<')) return text; // If it already has HTML, leave it as is
      
      // Automatically format plain text blocks into paragraphs
      return text
        .split(/(?=[A-Z][a-z]+(?:\s[A-Z][a-z]+)*:)/g) // Split nicely on major headers if present
        .map(paragraph => `<p style="margin-bottom: 1rem;">${paragraph.trim()}</p>`)
        .join('');
    };

    container.innerHTML = `
      <div class="card">
        <h2>${lesson.title}</h2>
        <div style="margin: 1.5rem 0; line-height: 1.6;">
          ${formatContent(lesson.content)}
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <button onclick="window.location.hash='#quiz/${subjectId}'">Take Quiz</button>
          <button onclick="window.location.hash='#home'" style="background: var(--text-muted); color: white;">Back Home</button>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = '<p>Failed to load lesson content.</p>';
  }
}