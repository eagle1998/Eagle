export function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export function maskEmail(email) {
  if (!email) return 'Anonymous';
  return email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
}

export const DELIVERY_FEE_THRESHOLD = 3;
export const DELIVERY_FEE_FLAT = 50;

export function calcDeliveryFee(totalItemsCount) {
  return totalItemsCount >= DELIVERY_FEE_THRESHOLD ? 0 : DELIVERY_FEE_FLAT;
}
