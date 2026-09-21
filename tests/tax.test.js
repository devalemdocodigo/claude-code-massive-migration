const { calculateTax } = require('../src/lib/tax');

describe('calculateTax', () => {
  it('calcula imposto para o Brasil', () => {
    expect(calculateTax(100, 'BR')).toBe(17);
  });

  it('calcula imposto para os EUA', () => {
    expect(calculateTax(100, 'US')).toBe(8);
  });

  it('retorna zero para região desconhecida', () => {
    expect(calculateTax(100, 'XX')).toBe(0);
  });

  it('retorna zero quando região não é informada', () => {
    expect(calculateTax(100, undefined)).toBe(0);
  });
});
