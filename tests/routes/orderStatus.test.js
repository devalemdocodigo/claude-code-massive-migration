const request = require('supertest');
const { createApp } = require('../../src/app');

const app = createApp();

describe('GET /orders/:id/status', () => {
  it('retorna um status válido para um id válido', async () => {
    const res = await request(app).get('/orders/abc123/status');

    expect(res.status).toBe(200);
    expect(res.body.orderId).toBe('abc123');
    expect(['processing', 'shipped', 'delivered', 'cancelled']).toContain(res.body.status);
  });

  it('é determinístico para o mesmo id', async () => {
    const first = await request(app).get('/orders/order-42/status');
    const second = await request(app).get('/orders/order-42/status');

    expect(first.body.status).toBe(second.body.status);
  });

  it('retorna 400 para um id com caracteres inválidos', async () => {
    const res = await request(app).get('/orders/abc!123/status');
    expect(res.status).toBe(400);
  });
});
