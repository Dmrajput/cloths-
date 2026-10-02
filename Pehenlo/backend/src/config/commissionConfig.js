const env = require('./env');

function sellerCommissionPercent() {
  const rate = Number(env.SELLER_COMMISSION_PERCENT);
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    throw new Error('SELLER_COMMISSION_PERCENT is invalid');
  }
  return rate;
}

function settlementDays() {
  const days = Number(env.SELLER_SETTLEMENT_DAYS);
  if (!Number.isInteger(days) || days < 0 || days > 90) return 2;
  return days;
}

function minimumPayoutAmount() {
  const amount = Number(env.MINIMUM_PAYOUT_AMOUNT);
  if (!Number.isInteger(amount) || amount < 1) return 500;
  return amount;
}

module.exports = {
  sellerCommissionPercent,
  settlementDays,
  minimumPayoutAmount,
};
