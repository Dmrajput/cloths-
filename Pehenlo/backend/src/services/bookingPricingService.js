const { BOOKING } = require('../utils/constants');
const { calculateRentalDays } = require('../utils/dateUtils');

function rupees(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.round(number);
}

/**
 * Prices are integer rupees, matching the listing fields.
 * A listing price covers one rental period (rentalDuration days).
 * Extra days round up to the next full period. There is no fractional daily rate.
 * Platform fee is PLATFORM_FEE_PERCENT of the rental subtotal only.
 */
function calculateBookingPrice({ listing, startDate, endDate, fulfillmentMethod }) {
  const rentalDays = calculateRentalDays(startDate, endDate);
  const periodDays = Math.max(1, Number(listing.rentalDuration) || 1);
  const rentalPeriods = Math.ceil(rentalDays / periodDays);
  const rentalPricePerPeriod = rupees(listing.price);
  const rentalSubtotal = rentalPricePerPeriod * rentalPeriods;
  const cleaningFee = rupees(listing.cleaningFee);
  const deliveryFee = fulfillmentMethod === 'DELIVERY' ? rupees(listing.deliveryFee) : 0;
  const platformFee = Math.round((rentalSubtotal * BOOKING.PLATFORM_FEE_PERCENT) / 100);
  const securityDeposit = rupees(listing.securityDeposit);
  const totalBeforeDeposit = rentalSubtotal + cleaningFee + deliveryFee + platformFee;
  const totalIncludingDeposit = totalBeforeDeposit + securityDeposit;

  return {
    rentalDays,
    rentalPeriods,
    periodDays,
    rentalPricePerPeriod,
    rentalSubtotal,
    cleaningFee,
    deliveryFee,
    platformFee,
    securityDeposit,
    totalBeforeDeposit,
    totalIncludingDeposit,
    currency: BOOKING.CURRENCY,
  };
}

module.exports = { calculateBookingPrice };
