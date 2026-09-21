const { calculateQuote } = require('../src/lib/pricing');

// TODO: reativar depois da migração de moeda para centavos (ticket PROJ-482, 2021-03-02)
// Ninguém mexeu nisso desde então.
describe.skip('calculateQuote - suporte a múltiplas moedas (WIP)', () => {
  it('calcula em USD', () => {
    const result = calculateQuote({
      items: [{ price: 10, qty: 1 }],
      currency: 'USD',
    });

    expect(result.currency).toBe('USD');
  });

  it('calcula em EUR', () => {
    const result = calculateQuote({
      items: [{ price: 10, qty: 1 }],
      currency: 'EUR',
    });

    expect(result.currency).toBe('EUR');
  });
});
