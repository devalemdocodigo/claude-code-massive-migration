const express = require('express');

const router = express.Router();

const STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];
const VALID_ID = /^[a-zA-Z0-9-]+$/;

function resolveOrderStatus(orderId) {
  if (!VALID_ID.test(orderId)) return null;

  let hash = 0;
  for (const char of orderId) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return STATUSES[hash % STATUSES.length];
}

router.get('/orders/:id/status', (req, res) => {
  const status = resolveOrderStatus(req.params.id);

  if (!status) {
    return res.status(400).json({ error: 'invalid order id' });
  }

  res.json({ orderId: req.params.id, status });
});

module.exports = router;
module.exports.resolveOrderStatus = resolveOrderStatus;
