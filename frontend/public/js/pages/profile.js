import { requireAuth } from '../modules/auth.js';
import { renderAppShell } from '../modules/navbar.js';
import { api } from '../modules/api.js';
import { toastError, toastSuccess } from '../modules/toast.js';
import { setUser } from '../modules/storage.js';
import { isValidEmail, isNonEmpty, isMinLength, setFieldError } from '../modules/validators.js';
import { formatDate } from '../modules/formatters.js';

requireAuth();
renderAppShell();

const profileForm = document.getElementById('profile-form');
const passwordForm = document.getElementById('password-form');

async function loadProfile() {
  try {
    const { data } = await api.get('/users/profile');
    const { user } = data;
    document.getElementById('profile-name').value = user.name;
    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-goal').value = user.dailyGoalLiters;
    document.getElementById('profile-avatar-initial').textContent = user.name.charAt(0).toUpperCase();
    document.getElementById('profile-member-since').textContent = `Member since ${formatDate(user.createdAt)}`;
  } catch (error) {
    toastError(error.message || 'Could not load profile');
  }
}

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('profile-name').value.trim();
  const email = document.getElementById('profile-email').value.trim();
  const dailyGoalLiters = document.getElementById('profile-goal').value;

  const nameValid = isNonEmpty(name);
  const emailValid = isValidEmail(email);

  setFieldError('profile-name', 'profile-name-error', nameValid, 'Name is required');
  setFieldError('profile-email', 'profile-email-error', emailValid, 'Enter a valid email address');
  if (!nameValid || !emailValid) return;

  try {
    const { data } = await api.put('/users/profile', { name, email, dailyGoalLiters: Number(dailyGoalLiters) });
    setUser(data.user);
    toastSuccess('Profile updated');
    renderAppShell();
  } catch (error) {
    toastError(error.message || 'Could not update profile');
  }
});

passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-new-password').value;

  const currentValid = isNonEmpty(currentPassword);
  const newValid = isMinLength(newPassword, 6);
  const matchValid = newPassword === confirmPassword;

  setFieldError('current-password', 'current-password-error', currentValid, 'Current password is required');
  setFieldError('new-password', 'new-password-error', newValid, 'Must be at least 6 characters');
  setFieldError('confirm-new-password', 'confirm-new-password-error', matchValid, 'Passwords do not match');

  if (!currentValid || !newValid || !matchValid) return;

  try {
    await api.put('/users/change-password', { currentPassword, newPassword });
    toastSuccess('Password updated');
    passwordForm.reset();
  } catch (error) {
    toastError(error.message || 'Could not update password');
  }
});

loadProfile();
