import { getUser } from './storage.js';
import { logout } from './auth.js';
import { bindThemeToggle } from './theme.js';

const NAV_LINKS = [
  { href: '/dashboard.html', label: 'Dashboard', icon: '📊' },
  { href: '/history.html', label: 'History', icon: '🕒' },
  { href: '/profile.html', label: 'Profile', icon: '👤' },
];

function sidebarHTML(activePath) {
  const links = NAV_LINKS.map(
    (link) => `
      <a href="${link.href}" class="sidebar__link ${activePath === link.href ? 'active' : ''}">
        <span aria-hidden="true">${link.icon}</span> ${link.label}
      </a>`
  ).join('');

  return `
    <div class="sidebar__logo">💧 <span>Aqua</span>Track</div>
    <nav class="flex flex-col gap-sm">${links}</nav>
    <div class="sidebar__footer">
      <button id="logout-btn" class="btn btn-ghost btn-block">Log out</button>
    </div>
  `;
}

function navbarHTML(user) {
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  return `
    <button class="icon-btn mobile-nav-toggle" id="mobile-nav-toggle" aria-label="Toggle menu">☰</button>
    <div class="navbar__greeting">Welcome back, ${user?.name || 'there'}</div>
    <div class="navbar__actions">
      <button class="theme-toggle" id="theme-toggle-btn"></button>
      <div class="profile-avatar" style="width:36px;height:36px;font-size:0.9rem;">${initial}</div>
    </div>
  `;
}

/**
 * Injects the shared sidebar + navbar shell into the current page.
 * Expects two empty containers in the HTML: #sidebar and #navbar.
 */
export function renderAppShell() {
  const sidebarEl = document.getElementById('sidebar');
  const navbarEl = document.getElementById('navbar');
  if (!sidebarEl || !navbarEl) return;

  const user = getUser();
  const activePath = window.location.pathname;

  sidebarEl.innerHTML = sidebarHTML(activePath);
  navbarEl.innerHTML = navbarHTML(user);

  document.getElementById('logout-btn')?.addEventListener('click', logout);
  bindThemeToggle('theme-toggle-btn');

  document.getElementById('mobile-nav-toggle')?.addEventListener('click', () => {
    sidebarEl.classList.toggle('open');
  });
}
