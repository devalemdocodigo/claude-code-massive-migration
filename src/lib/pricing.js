const COUPONS = {
  SAVE10: { type: 'percent', value: 10 },
  SAVE20: { type: 'percent', value: 20 },
  FLAT5: { type: 'fixed', value: 5 },
};

function roundCurrency(amount) {
  return Math.round(amount * 100) / 100;
}

function computeDiscount(subtotal, couponCode) {
  const coupon = COUPONS[couponCode];
  if (!coupon) return 0;

  const raw = coupon.type === 'percent'
    ? subtotal * (coupon.value / 100)
    : coupon.value;

  return Math.min(raw, subtotal);
}

function calculateQuote({ items, couponCode }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items must be a non-empty array');
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = roundCurrency(computeDiscount(subtotal, couponCode));
  const total = roundCurrency(subtotal - discount);

  return { subtotal: roundCurrency(subtotal), discount, total };
}

module.exports = {
  calculateQuote,
  // Exposto apenas para os testes de "internals" (ver tests/pricing.internals.test.js)
  _internal: { roundCurrency, computeDiscount, COUPONS },
};
