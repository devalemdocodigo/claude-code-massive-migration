const express = require('express');
const quoteRoute = require('./routes/quote');
const orderStatusRoute = require('./routes/orderStatus');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(quoteRoute);
  app.use(orderStatusRoute);
  return app;
}

module.exports = { createApp };
