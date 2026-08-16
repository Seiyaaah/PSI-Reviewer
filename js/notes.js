export async function renderNotes(container, subjectId = null) {
  try {
    const res = await fetch('data/notes.json');
    const notesData = await res.json();

    // SCENARIO 1: A specific subject ID was clicked (Show Detail Page)
    if (subjectId) {
      // Handles both if notes.json is an array or an object dictionary
      const note = Array.isArray(notesData) 
        ? notesData.find(n => n.id === subjectId) 
        : notesData[subjectId];

      if (!note) {
        container.innerHTML = `
          <div class="card">
            <h2>Notes Not Found</h2>
            <p>No detailed notes available for this topic.</p>
            <button onclick="window.location.hash='#notes'">← Back to Notes</button>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="card" style="max-width: 800px; margin: 0 auto; padding: 2rem;">
          <button onclick="window.location.hash='#notes'" style="margin-bottom: 1.5rem; background: var(--text-muted); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">← Back to Notes List</button>
          
          <h1 style="margin-bottom: 1rem; font-size: 2rem;">${note.title}</h1>
          
          <div class="notes-body" style="line-height: 1.6; font-size: 1.1rem; margin-top: 1rem;">
            ${note.content || note.summary}
          </div>

          <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <button onclick="window.location.hash='#quiz/${subjectId}'" style="background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: bold;">Take Quiz for this Topic →</button>
          </div>
        </div>
      `;
      return;
    }

    // SCENARIO 2: Show the main list of note cards (Your current view)
    const notesArray = Array.isArray(notesData) ? notesData : Object.keys(notesData).map(key => ({ id: key, ...notesData[key] }));

    container.innerHTML = `
      <h2>Quick Revision Notes</h2>
      <div style="margin-top: 1rem; display: grid; gap: 1rem;">
        ${notesArray.map(note => `
          <div class="card note-card" data-id="${note.id}" style="cursor: pointer; transition: transform 0.2s;">
            <h3>${note.title}</h3>
            <p style="margin-top: 0.5rem; color: var(--text-muted);">${note.summary || note.description || ''}</p>
            <span style="display: inline-block; margin-top: 0.75rem; color: var(--primary-color); font-weight: bold; font-size: 0.9rem;">Read Full Notes →</span>
          </div>
        `).join('')}
      </div>
    `;

    // Add click listeners to each card to trigger the detail page view
    container.querySelectorAll('.note-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        window.location.hash = `#notes/${id}`;
      });
    });

  } catch (err) {
    console.error('Notes loading error:', err);
    container.innerHTML = '<p>Failed to load notes.</p>';
  }
}