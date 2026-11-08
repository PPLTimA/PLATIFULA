// Titik masuk aplikasi: sambungkan database, jalankan tugas berkala, lalu buka HTTP server.
const http = require('node:http');
const config = require('./src/config');
const db = require('./src/core/database');
const { createRequestHandler } = require('./src/app');
const { startProductScheduler } = require('./src/members/Kenneth Nathaniel Tirtadjaja/PBI-13-discount-schedule/backend/scheduler');

async function main() {
  await db.init();
  const server = http.createServer(createRequestHandler());

  server.listen(config.port, () => {
    startProductScheduler();
    console.log(`PLATIFUL is running at http://localhost:${config.port}`);
  });

  const shutdown = () => {
    server.close();
    db.close().finally(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error(`\nGagal terhubung ke MySQL: ${error.message}`);
  console.error('Pastikan MySQL di XAMPP sudah Start. Atur DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME bila perlu.');
  process.exit(1);
});
