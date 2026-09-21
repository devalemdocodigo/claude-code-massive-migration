const { applyLegacyDiscount } = require('../src/lib/legacyDiscount');

describe('applyLegacyDiscount - edge cases', () => {
  it('funciona com zero pontos', () => {
    const result = applyLegacyDiscount({ subtotal: 50, loyaltyPoints: 0 });

    expect(result.discount).toBe(0);
    expect(result.total).toBe(50);
  });

  it('funciona quando loyaltyPoints não é informado', () => {
    const result = applyLegacyDiscount({ subtotal: 50 });

    expect(result.discount).toBe(0);
    expect(result.total).toBe(50);
  });

  it('funciona com subtotal zero', () => {
    const result = applyLegacyDiscount({ subtotal: 0, loyaltyPoints: 100 });

    expect(result.discount).toBe(0);
    expect(result.total).toBe(0);
  });
});
