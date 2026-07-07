import { requireAuth } from '../modules/auth.js';
import { renderAppShell } from '../modules/navbar.js';
import { api } from '../modules/api.js';
import { toastError, toastSuccess } from '../modules/toast.js';
import { formatDate, toInputDate } from '../modules/formatters.js';
import { isPositiveNumber, setFieldError } from '../modules/validators.js';

requireAuth();
renderAppShell();

const state = {
  search: '',
  sort: 'date_desc',
  page: 1,
  limit: 8,
  editingId: null,
};

let searchDebounce;

const tableBody = document.getElementById('history-tbody');
const paginationEl = document.getElementById('pagination');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const modalOverlay = document.getElementById('usage-modal-overlay');
const usageForm = document.getElementById('usage-form');
const modalTitle = document.getElementById('modal-title');

async function loadLogs() {
  const params = new URLSearchParams({
    page: state.page,
    limit: state.limit,
    sort: state.sort,
  });
  if (state.search) params.set('search', state.search);

  try {
    const { data } = await api.get(`/usage?${params.toString()}`);
    renderTable(data.logs);
    renderPagination(data.pagination);
  } catch (error) {
    toastError(error.message || 'Could not load usage history');
  }
}

function renderTable(logs) {
  if (!logs.length) {
    tableBody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No entries found. Try adjusting your search or add a new entry.</div></td></tr>`;
    return;
  }

  tableBody.innerHTML = logs
    .map(
      (log) => `
      <tr>
        <td>${formatDate(log.date)}</td>
        <td>${log.liters} L</td>
        <td>${log.location || '&mdash;'}</td>
        <td>${log.note || '&mdash;'}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-sm btn-secondary" data-edit="${log._id}">Edit</button>
            <button class="btn btn-sm btn-danger" data-delete="${log._id}">Delete</button>
          </div>
        </td>
      </tr>`
    )
    .join('');

  tableBody.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openEditModal(logs.find((l) => l._id === btn.dataset.edit)));
  });
  tableBody.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => handleDelete(btn.dataset.delete));
  });
}

function renderPagination({ page, totalPages }) {
  const buttons = [];
  buttons.push(`<button data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>&lsaquo;</button>`);
  for (let i = 1; i <= totalPages; i++) {
    buttons.push(`<button data-page="${i}" class="${i === page ? 'active' : ''}">${i}</button>`);
  }
  buttons.push(`<button data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>&rsaquo;</button>`);
  paginationEl.innerHTML = buttons.join('');

  paginationEl.querySelectorAll('button[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetPage = Number(btn.dataset.page);
      if (targetPage >= 1 && targetPage <= totalPages) {
        state.page = targetPage;
        loadLogs();
      }
    });
  });
}

async function handleDelete(id) {
  if (!confirm('Delete this usage entry? This cannot be undone.')) return;
  try {
    await api.delete(`/usage/${id}`);
    toastSuccess('Entry deleted');
    loadLogs();
  } catch (error) {
    toastError(error.message || 'Could not delete entry');
  }
}

function openAddModal() {
  state.editingId = null;
  modalTitle.textContent = 'Add usage entry';
  usageForm.reset();
  document.getElementById('usage-date').value = toInputDate(new Date());
  modalOverlay.classList.remove('hidden');
}

function openEditModal(log) {
  if (!log) return;
  state.editingId = log._id;
  modalTitle.textContent = 'Edit usage entry';
  document.getElementById('usage-liters').value = log.liters;
  document.getElementById('usage-date').value = toInputDate(log.date);
  document.getElementById('usage-location').value = log.location || '';
  document.getElementById('usage-note').value = log.note || '';
  modalOverlay.classList.remove('hidden');
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

usageForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const liters = document.getElementById('usage-liters').value;
  const date = document.getElementById('usage-date').value;
  const location = document.getElementById('usage-location').value.trim();
  const note = document.getElementById('usage-note').value.trim();

  const litersValid = isPositiveNumber(liters) && Number(liters) > 0;
  setFieldError('usage-liters', 'usage-liters-error', litersValid, 'Enter a valid amount in liters');
  if (!litersValid) return;

  const payload = { liters: Number(liters), date, location, note };

  try {
    if (state.editingId) {
      await api.put(`/usage/${state.editingId}`, payload);
      toastSuccess('Entry updated');
    } else {
      await api.post('/usage', payload);
      toastSuccess('Entry added');
    }
    closeModal();
    loadLogs();
  } catch (error) {
    toastError(error.message || 'Could not save entry');
  }
});

document.getElementById('add-usage-btn').addEventListener('click', openAddModal);
document.getElementById('modal-close-btn').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    state.search = searchInput.value.trim();
    state.page = 1;
    loadLogs();
  }, 350);
});

sortSelect.addEventListener('change', () => {
  state.sort = sortSelect.value;
  state.page = 1;
  loadLogs();
});

loadLogs();
