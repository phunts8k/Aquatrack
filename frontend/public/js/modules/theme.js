import { getStoredTheme, setStoredTheme } from './storage.js';

export function initTheme() {
  const stored = getStoredTheme();
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  setStoredTheme(next);
  return next;
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

/** Wires up a theme toggle button by id, updating its label as it switches. */
export function bindThemeToggle(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  const updateLabel = () => {
    const theme = getCurrentTheme();
    btn.textContent = theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode';
  };

  updateLabel();
  btn.addEventListener('click', () => {
    toggleTheme();
    updateLabel();
  });
}
