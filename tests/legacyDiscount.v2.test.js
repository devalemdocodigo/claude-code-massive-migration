// TODO: consolidar com legacyDiscount.test.js quando sobrar tempo
const { applyLegacyDiscount } = require('../src/lib/legacyDiscount');

describe('applyLegacyDiscount - v2', () => {
  it('converte pontos de fidelidade em desconto (caso 2)', () => {
    const result = applyLegacyDiscount({ subtotal: 200, loyaltyPoints: 1000 });

    expect(result.discount).toBe(10);
    expect(result.total).toBe(190);
  });

  it('não deixa o desconto passar do subtotal (caso 2)', () => {
    const result = applyLegacyDiscount({ subtotal: 20, loyaltyPoints: 50000 });

    expect(result.discount).toBe(20);
    expect(result.total).toBe(0);
  });
});
