const { createApp } = require('./app');

const PORT = process.env.PORT || 3000;

createApp().listen(PORT, () => {
  console.log(`quote-service-demo escutando na porta ${PORT}`);
});
