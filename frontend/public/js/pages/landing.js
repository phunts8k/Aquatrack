import { isAuthenticated } from '../modules/auth.js';

const ctaButtons = document.querySelectorAll('[data-cta]');
ctaButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    window.location.href = isAuthenticated() ? '/dashboard.html' : '/register.html';
  });
});
