import { api } from './api.js';
import { setToken, setUser, getToken, clearSession } from './storage.js';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password }, { auth: false });
  setToken(data.token);
  setUser(data.user);
  return data.user;
}

export async function register(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password }, { auth: false });
  setToken(data.token);
  setUser(data.user);
  return data.user;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore network errors on logout - we clear the local session regardless
  }
  clearSession();
  window.location.href = '/login.html';
}

export function isAuthenticated() {
  return Boolean(getToken());
}

/**
 * Call at the top of any page that requires login. Redirects to /login.html
 * if there is no token stored.
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
  }
}

/**
 * Call at the top of login/register pages. Redirects already-authenticated
 * users straight to the dashboard.
 */
export function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = '/dashboard.html';
  }
}
