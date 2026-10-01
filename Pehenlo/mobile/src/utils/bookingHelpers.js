const TIMEZONE = 'Asia/Kolkata';

export function businessTodayKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function currentBusinessMonth(now = new Date()) {
  const today = businessTodayKey(now);
  const [year, month] = today.split('-').map(Number);
  return { year, month };
}

export function shiftMonth(year, month, delta) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function dateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function rentalDays(startDate, endDate) {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  return Math.round((end - start) / 86400000) + 1;
}

export function addDays(key, days) {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function eachDate(startDate, endDate) {
  const count = rentalDays(startDate, endDate);
  const keys = [];
  for (let index = 0; index < count; index += 1) {
    keys.push(addDays(startDate, index));
  }
  return keys;
}

export function formatDisplayDate(key) {
  if (!key) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${key}T00:00:00Z`));
}

export function formatMonthTitle(year, month) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function rupees(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export function expandUnavailable(blockedDates = [], bookedRanges = []) {
  const unavailable = new Set(blockedDates);
  bookedRanges.forEach((range) => {
    if (!range?.startDate || !range?.endDate || range.endDate < range.startDate) return;
    eachDate(range.startDate, range.endDate).forEach((key) => unavailable.add(key));
  });
  return unavailable;
}

export function rangeHitsUnavailable(startDate, endDate, unavailable) {
  return eachDate(startDate, endDate).some((key) => unavailable.has(key));
}

export function monthCells(year, month) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const leading = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = Array(leading).fill(null);
  for (let day = 1; day <= days; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function countdownLabel(expiresAt, now = Date.now()) {
  if (!expiresAt) return '';
  const remaining = new Date(expiresAt).getTime() - now;
  if (remaining <= 0) return '0:00';
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
