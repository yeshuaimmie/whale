module.exports = function generateReferralCode(name = 'user') {
  const base = String(name).replace(/\s+/g, '').slice(0, 6).toUpperCase() || 'USER';
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${base}${random}`;
};
