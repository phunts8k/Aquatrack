import { register, redirectIfAuthenticated } from '../modules/auth.js';
import { toastError, toastSuccess } from '../modules/toast.js';
import { isValidEmail, isNonEmpty, isMinLength, setFieldError } from '../modules/validators.js';

redirectIfAuthenticated();

const form = document.getElementById('register-form');
const submitBtn = document.getElementById('register-submit');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  const nameValid = isNonEmpty(name);
  const emailValid = isValidEmail(email);
  const passwordValid = isMinLength(password, 6);
  const matchValid = password === confirmPassword;

  setFieldError('name', 'name-error', nameValid, 'Name is required');
  setFieldError('email', 'email-error', emailValid, 'Enter a valid email address');
  setFieldError('password', 'password-error', passwordValid, 'Password must be at least 6 characters');
  setFieldError('confirm-password', 'confirm-password-error', matchValid, 'Passwords do not match');

  if (!nameValid || !emailValid || !passwordValid || !matchValid) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';

  try {
    await register(name, email, password);
    toastSuccess('Account created! Welcome to AquaTrack.');
    window.location.href = '/dashboard.html';
  } catch (error) {
    toastError(error.message || 'Registration failed');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create account';
  }
});
