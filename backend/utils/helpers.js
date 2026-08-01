const maskEmail = (email) => {
  if (!email) return 'Anonymous';
  return email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
};

const excludeNulls = (obj) => {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== null && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
};

const formatCurrencyINR = (amount) => {
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
};

module.exports = { maskEmail, excludeNulls, formatCurrencyINR };
