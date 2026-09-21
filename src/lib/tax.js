const TAX_RATES = {
  BR: 0.17,
  US: 0.08,
  EU: 0.21,
};

const DEFAULT_RATE = 0;

function calculateTax(amount, region) {
  const rate = TAX_RATES[region] ?? DEFAULT_RATE;
  return Math.round(amount * rate * 100) / 100;
}

module.exports = { calculateTax };
