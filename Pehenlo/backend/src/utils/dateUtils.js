const { BOOKING } = require('./constants');

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_KEY = /^(\d{4})-(\d{2})$/;

function isDateKey(value) {
  if (typeof value !== 'string' || !DATE_KEY.test(value)) return false;
  const date = dateKeyToUtc(value);
  return utcToDateKey(date) === value;
}

function dateKeyToUtc(key) {
  const [, year, month, day] = DATE_KEY.exec(key) || [];
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function utcToDateKey(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BOOKING.TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function addDays(key, days) {
  const date = dateKeyToUtc(key);
  date.setUTCDate(date.getUTCDate() + days);
  return utcToDateKey(date);
}

function calculateRentalDays(startDate, endDate) {
  const start = dateKeyToUtc(startDate).getTime();
  const end = dateKeyToUtc(endDate).getTime();
  return Math.round((end - start) / 86400000) + 1;
}

function eachDateKey(startDate, endDate) {
  const count = calculateRentalDays(startDate, endDate);
  const keys = [];
  for (let index = 0; index < count; index += 1) {
    keys.push(addDays(startDate, index));
  }
  return keys;
}

function monthRange(month) {
  if (typeof month !== 'string' || !MONTH_KEY.test(month)) return null;
  const start = `${month}-01`;
  if (!isDateKey(start)) return null;
  const [, year, monthNumber] = MONTH_KEY.exec(month);
  const lastDay = new Date(Date.UTC(Number(year), Number(monthNumber), 0)).getUTCDate();
  return {
    start,
    end: `${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

function validateRentalDateRange(startDate, endDate, options = {}) {
  if (!isDateKey(startDate) || !isDateKey(endDate)) {
    return { ok: false, code: 'DATES_INVALID', message: 'Choose a valid rental date range.' };
  }
  if (endDate < startDate) {
    return { ok: false, code: 'DATES_INVALID', message: 'The return date must be on or after the start date.' };
  }

  const today = options.today || todayKey();
  if (startDate < today || endDate < today) {
    return { ok: false, code: 'DATES_INVALID', message: 'Rental dates cannot be in the past.' };
  }

  const rentalDays = calculateRentalDays(startDate, endDate);
  const minimumDays = Math.max(1, Number(options.minimumDays) || 1);
  if (rentalDays < minimumDays) {
    return {
      ok: false,
      code: 'DATES_INVALID',
      message: `This outfit requires at least ${minimumDays} rental day${minimumDays === 1 ? '' : 's'}.`,
    };
  }
  if (rentalDays > BOOKING.MAX_RENTAL_DAYS) {
    return {
      ok: false,
      code: 'DATES_INVALID',
      message: `Choose a rental of ${BOOKING.MAX_RENTAL_DAYS} days or fewer.`,
    };
  }

  return { ok: true, rentalDays, minimumDays };
}

module.exports = {
  isDateKey,
  dateKeyToUtc,
  utcToDateKey,
  todayKey,
  addDays,
  calculateRentalDays,
  eachDateKey,
  monthRange,
  validateRentalDateRange,
};
