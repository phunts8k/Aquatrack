export function formatDate(dateInput, options = {}) {
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

export function formatDateShort(dateInput) {
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatLiters(value) {
  const num = Number(value) || 0;
  return `${num.toLocaleString('en-US', { maximumFractionDigits: 1 })} L`;
}

export function toInputDate(dateInput) {
  const date = new Date(dateInput);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}
