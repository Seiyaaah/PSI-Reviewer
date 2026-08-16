export function saveProgress(subjectId, score, total) {
  const progress = getProgress();
  progress[subjectId] = { score, total, date: new Date().toISOString() };
  localStorage.setItem('learnpwa_progress', JSON.stringify(progress));
}

export function getProgress() {
  const data = localStorage.getItem('learnpwa_progress');
  return data ? JSON.parse(data) : {};
}