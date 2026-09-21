const { applyLegacyDiscount } = require('../src/lib/legacyDiscount');

describe('applyLegacyDiscount (programa de fidelidade antigo)', () => {
  it('converte pontos de fidelidade em desconto', () => {
    const result = applyLegacyDiscount({ subtotal: 100, loyaltyPoints: 500 });

    expect(result.discount).toBe(5);
    expect(result.total).toBe(95);
  });

  it('não deixa o desconto passar do subtotal', () => {
    const result = applyLegacyDiscount({ subtotal: 10, loyaltyPoints: 100000 });

    expect(result.discount).toBe(10);
    expect(result.total).toBe(0);
  });
});
