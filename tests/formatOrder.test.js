const { formatOrderSummary } = require('../src/lib/formatOrder');

describe('formatOrderSummary', () => {
  it('formata os valores com duas casas decimais', () => {
    const result = formatOrderSummary({ subtotal: 25, discount: 2.5, tax: 1, total: 23.5 });

    expect(result).toEqual({
      subtotal: '25.00',
      discount: '2.50',
      tax: '1.00',
      total: '23.50',
    });
  });
});
