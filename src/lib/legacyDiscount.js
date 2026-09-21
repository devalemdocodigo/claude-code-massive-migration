// Motor de desconto do antigo programa de fidelidade ("punch card").
// Foi substituído pelo sistema de cupons em pricing.js quando o programa de
// fidelidade foi descontinuado. Nada em src/ importa este módulo hoje.

const POINTS_TO_DISCOUNT_RATIO = 0.01; // 1 ponto = R$0,01 de desconto

function applyLegacyDiscount(cart) {
  const { subtotal, loyaltyPoints = 0 } = cart;
  const discount = Math.min(loyaltyPoints * POINTS_TO_DISCOUNT_RATIO, subtotal);
  return { subtotal, discount, total: subtotal - discount };
}

module.exports = { applyLegacyDiscount };
