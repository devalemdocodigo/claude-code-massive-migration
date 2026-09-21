function formatOrderSummary({ subtotal, discount, tax, total }) {
  return {
    subtotal: subtotal.toFixed(2),
    discount: discount.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
  };
}

module.exports = { formatOrderSummary };
