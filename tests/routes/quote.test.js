const request = require('supertest');
const { createApp } = require('../../src/app');

const app = createApp();

describe('POST /quote', () => {
  it('retorna a cotação com subtotal, desconto, imposto e total', async () => {
    const res = await request(app)
      .post('/quote')
      .send({ items: [{ price: 100, qty: 1 }], couponCode: 'SAVE10', region: 'BR' });

    expect(res.status).toBe(200);
    expect(res.body.subtotal).toBe('100.00');
    expect(res.body.discount).toBe('10.00');
    expect(res.body.grandTotal).toBe('105.30');
  });

  it('retorna 400 quando items está ausente', async () => {
    const res = await request(app).post('/quote').send({});
    expect(res.status).toBe(400);
  });

  it('retorna 400 quando items é um array vazio', async () => {
    const res = await request(app).post('/quote').send({ items: [] });
    expect(res.status).toBe(400);
  });
});
