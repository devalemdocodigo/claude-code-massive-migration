const { _internal } = require('../src/lib/pricing');

describe('pricing internals', () => {
  it('roundCurrency arredonda para duas casas decimais', () => {
    expect(_internal.roundCurrency(1.006)).toBe(1.01);
    expect(_internal.roundCurrency(1.004)).toBe(1);
    expect(_internal.roundCurrency(10)).toBe(10);
  });

  it('computeDiscount calcula percentual usando a tabela de cupons', () => {
    expect(_internal.computeDiscount(100, 'SAVE10')).toBe(10);
  });

  it('a tabela de cupons contém exatamente SAVE10, SAVE20 e FLAT5', () => {
    expect(Object.keys(_internal.COUPONS)).toEqual(['SAVE10', 'SAVE20', 'FLAT5']);
  });

  it('SAVE20 é do tipo percent', () => {
    expect(_internal.COUPONS.SAVE20.type).toBe('percent');
    expect(_internal.COUPONS.SAVE20.value).toBe(20);
  });
});
