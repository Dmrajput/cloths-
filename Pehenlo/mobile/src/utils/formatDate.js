/**
 * Basic date formatting helpers.
 * Booking/availability logic belongs in later phases.
 */
export function formatDate(date, options = {}) {
  if (!date) return '';

  const value = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(value.getTime())) {
    return '';
  }

  return value.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

export function formatDateRange(start, end) {
  const from = formatDate(start);
  const to = formatDate(end);

  if (!from && !to) return '';
  if (!to) return from;
  if (!from) return to;

  return `${from} – ${to}`;
}

export default formatDate;
