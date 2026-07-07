import { requireAuth } from '../modules/auth.js';
import { renderAppShell } from '../modules/navbar.js';
import { api } from '../modules/api.js';
import { toastError, toastSuccess } from '../modules/toast.js';
import { formatLiters, formatDateShort, formatDate } from '../modules/formatters.js';
import { drawLineChart, drawBarChart } from '../modules/charts.js';
import { isPositiveNumber, setFieldError } from '../modules/validators.js';

requireAuth();
renderAppShell();

const WATER_TIPS = [
  'Fix leaking taps promptly - a slow drip can waste over 15 liters a day.',
  'Take showers under 5 minutes to cut water use significantly.',
  'Turn off the tap while brushing your teeth or shaving.',
  'Run washing machines and dishwashers only with a full load.',
  'Collect and reuse rainwater for gardening where possible.',
];

let trendData = [];
let trendView = 'daily'; // daily | weekly

async function loadDashboard() {
  try {
    const { data } = await api.get('/dashboard/summary');
    renderStatCards(data);
    trendData = data.trend || [];
    renderTrendChart();
    renderTips();
    renderRecentActivity(data.recentActivity || []);
  } catch (error) {
    toastError(error.message || 'Could not load dashboard data');
  }
}

function renderStatCards(data) {
  document.getElementById('stat-today').textContent = formatLiters(data.today);
  document.getElementById('stat-week').textContent = formatLiters(data.week);
  document.getElementById('stat-month').textContent = formatLiters(data.month);
  document.getElementById('stat-avg').textContent = formatLiters(data.averageDaily);
  document.getElementById('stat-peak').textContent = formatLiters(data.highest);
  document.getElementById('stat-lowest').textContent = formatLiters(data.lowest);
  document.getElementById('stat-score').textContent = `${data.savingScore}`;
}

function renderTrendChart() {
  const canvas = document.getElementById('trend-chart');
  if (!canvas) return;

  let points;
  if (trendView === 'daily') {
    points = trendData.map((d) => ({ label: formatDateShort(d.date), value: d.total }));
  } else {
    // Group into weekly buckets (chunks of 7 days) for a coarser view
    const weeks = [];
    for (let i = 0; i < trendData.length; i += 7) {
      const chunk = trendData.slice(i, i + 7);
      const total = chunk.reduce((sum, d) => sum + d.total, 0);
      weeks.push({ label: `Wk ${Math.floor(i / 7) + 1}`, value: total });
    }
    points = weeks;
  }

  drawLineChart(canvas, points);
}

function renderTips() {
  const container = document.getElementById('tips-list');
  if (!container) return;
  const shuffled = [...WATER_TIPS].sort(() => Math.random() - 0.5).slice(0, 3);
  container.innerHTML = shuffled.map((tip) => `<div class="tip-card">💡 <span>${tip}</span></div>`).join('');
}

function renderRecentActivity(logs) {
  const container = document.getElementById('recent-activity');
  if (!container) return;

  if (!logs.length) {
    container.innerHTML = '<div class="empty-state">No usage logged yet. Add your first entry from the History page.</div>';
    return;
  }

  container.innerHTML = logs
    .map(
      (log) => `
      <div class="activity-item">
        <span>${formatDate(log.date)}${log.location ? ` &middot; ${log.location}` : ''}</span>
        <strong>${formatLiters(log.liters)}</strong>
      </div>`
    )
    .join('');
}

// Chart view tabs (daily / weekly)
document.querySelectorAll('.chart-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.chart-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    trendView = tab.dataset.view;
    renderTrendChart();
  });
});

// Quick "add usage" form on the dashboard
const quickAddForm = document.getElementById('quick-add-form');
if (quickAddForm) {
  quickAddForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const liters = document.getElementById('quick-liters').value;
    const location = document.getElementById('quick-location').value.trim();

    const litersValid = isPositiveNumber(liters) && Number(liters) > 0;
    setFieldError('quick-liters', 'quick-liters-error', litersValid, 'Enter a valid amount in liters');
    if (!litersValid) return;

    try {
      await api.post('/usage', { liters: Number(liters), location });
      toastSuccess('Usage logged');
      quickAddForm.reset();
      loadDashboard();
    } catch (error) {
      toastError(error.message || 'Could not log usage');
    }
  });
}

window.addEventListener('resize', renderTrendChart);

loadDashboard();
