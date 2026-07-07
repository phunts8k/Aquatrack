const TOKEN_KEY = 'aquatrack_token';
const USER_KEY = 'aquatrack_user';
const THEME_KEY = 'aquatrack_theme';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const setUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const clearUser = () => localStorage.removeItem(USER_KEY);

export const getStoredTheme = () => localStorage.getItem(THEME_KEY);
export const setStoredTheme = (theme) => localStorage.setItem(THEME_KEY, theme);

export const clearSession = () => {
  clearToken();
  clearUser();
};
