const { sellerCommissionPercent, settlementDays } = require('../config/commissionConfig');

function kolkataDateKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function addCalendarDays(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getUTCDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function settlementAvailableAt(paidAt, days = settlementDays()) {
  const start = paidAt ? new Date(paidAt) : new Date();
  const availableDay = addCalendarDays(kolkataDateKey(start), days);
  return new Date(`${availableDay}T00:00:00+05:30`);
}

function calculateSellerEarning(booking) {
  const grossRentalAmount = Math.max(0, Math.round(Number(booking?.rentalSubtotal) || 0));
  const commissionRate = sellerCommissionPercent();
  const commissionAmount = Math.round((grossRentalAmount * commissionRate) / 100);
  const otherAdjustments = 0;
  const netEarning = grossRentalAmount - commissionAmount + otherAdjustments;
  return {
    grossRentalAmount,
    commissionRate,
    commissionAmount,
    otherAdjustments,
    netEarning,
  };
}

module.exports = {
  calculateSellerEarning,
  settlementAvailableAt,
};
