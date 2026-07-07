export function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isMinLength(value, min) {
  return typeof value === 'string' && value.trim().length >= min;
}

export function isPositiveNumber(value) {
  const num = Number(value);
  return !Number.isNaN(num) && num >= 0;
}

/**
 * Shows/hides a .form-error element next to a field based on a condition.
 * @param {string} fieldId - id of the input
 * @param {string} errorId - id of the sibling error element
 * @param {boolean} isValid
 * @param {string} message
 */
export function setFieldError(fieldId, errorId, isValid, message) {
  const errorEl = document.getElementById(errorId);
  const fieldEl = document.getElementById(fieldId);
  if (!errorEl) return;

  if (isValid) {
    errorEl.classList.remove('visible');
    errorEl.textContent = '';
    fieldEl?.style.removeProperty('border-color');
  } else {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
    if (fieldEl) fieldEl.style.borderColor = 'var(--color-danger)';
  }
}
