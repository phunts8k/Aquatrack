import { login, redirectIfAuthenticated } from '../modules/auth.js';
import { toastError, toastSuccess } from '../modules/toast.js';
import { isValidEmail, isNonEmpty, setFieldError } from '../modules/validators.js';

redirectIfAuthenticated();

const form = document.getElementById('login-form');
const submitBtn = document.getElementById('login-submit');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const emailValid = isValidEmail(email);
  const passwordValid = isNonEmpty(password);

  setFieldError('email', 'email-error', emailValid, 'Enter a valid email address');
  setFieldError('password', 'password-error', passwordValid, 'Password is required');

  if (!emailValid || !passwordValid) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    await login(email, password);
    toastSuccess('Welcome back!');
    window.location.href = '/dashboard.html';
  } catch (error) {
    toastError(error.message || 'Login failed');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log in';
  }
});
