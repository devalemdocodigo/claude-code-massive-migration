const express = require('express');
const { calculateQuote } = require('../lib/pricing');
const { calculateTax } = require('../lib/tax');
const { formatOrderSummary } = require('../lib/formatOrder');

const router = express.Router();

router.post('/quote', (req, res) => {
  const { items, couponCode, region } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' });
  }

  const { subtotal, discount, total } = calculateQuote({ items, couponCode });
  const tax = calculateTax(total, region);
  const grandTotal = Math.round((total + tax) * 100) / 100;

  res.json({
    ...formatOrderSummary({ subtotal, discount, tax, total }),
    grandTotal: grandTotal.toFixed(2),
  });
});

module.exports = router;
