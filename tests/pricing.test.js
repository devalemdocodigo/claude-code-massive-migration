const { calculateQuote } = require('../src/lib/pricing');

describe('calculateQuote', () => {
  it('soma o subtotal a partir dos itens', () => {
    const result = calculateQuote({
      items: [{ price: 10, qty: 2 }, { price: 5, qty: 1 }],
    });

    expect(result.subtotal).toBe(25);
    expect(result.discount).toBe(0);
    expect(result.total).toBe(25);
  });

  it('aplica cupom percentual', () => {
    const result = calculateQuote({
      items: [{ price: 100, qty: 1 }],
      couponCode: 'SAVE10',
    });

    expect(result.discount).toBe(10);
    expect(result.total).toBe(90);
  });

  it('aplica cupom de valor fixo', () => {
    const result = calculateQuote({
      items: [{ price: 20, qty: 1 }],
      couponCode: 'FLAT5',
    });

    expect(result.discount).toBe(5);
    expect(result.total).toBe(15);
  });

  it('ignora cupom desconhecido', () => {
    const result = calculateQuote({
      items: [{ price: 20, qty: 1 }],
      couponCode: 'NAOEXISTE',
    });

    expect(result.discount).toBe(0);
    expect(result.total).toBe(20);
  });

  it('nunca deixa o desconto ultrapassar o subtotal', () => {
    const result = calculateQuote({
      items: [{ price: 3, qty: 1 }],
      couponCode: 'SAVE20',
    });

    expect(result.discount).toBeLessThanOrEqual(result.subtotal);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it('lança erro quando não há itens', () => {
    expect(() => calculateQuote({ items: [] })).toThrow();
  });
});
