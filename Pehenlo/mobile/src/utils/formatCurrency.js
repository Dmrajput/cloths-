/**
 * Basic currency formatter for INR display.
 * Business-specific rental pricing belongs in later phases.
 */
export function formatCurrency(amount, options = {}) {
  const { currency = 'INR', withSymbol = true } = options;
  const value = Number(amount);

  if (Number.isNaN(value)) {
    return withSymbol ? '₹0' : '0';
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);

  return withSymbol ? `₹${formatted}` : formatted;
}

export default formatCurrency;
