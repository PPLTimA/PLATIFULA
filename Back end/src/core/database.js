// Penyimpanan data: MySQL sebagai penyimpanan permanen, memori sebagai cache.
//
// Setiap koleksi (users, products, ...) adalah satu tabel dengan kolom
// (row_no, id, data JSON). Seluruh data dimuat ke memori saat server start;
// setiap penulisan mengganti isi tabel di dalam satu transaksi.
// Saat pertama kali jalan, data awal diimpor sekali dari folder `seed/`.
const fs = require('node:fs');
const path = require('node:path');
const config = require('../config');

const COLLECTIONS = [
  'products', 'orders', 'users', 'sessions', 'reports', 'articles', 'commission',
  'settlements', 'categories', 'notifications', 'templates', 'reviews',
  'announcements', 'retailerReports',
];

const cache = {};
let pool = null;
let writeQueue = Promise.resolve();

const clone = (value) => JSON.parse(JSON.stringify(value));

function loadSeed(name) {
  const file = path.join(config.paths.seed, `${name}.json`);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
}

function persist(name) {
  writeQueue = writeQueue.then(async () => {
    const rows = cache[name];
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(`DELETE FROM \`${name}\``);
      if (rows.length) {
        await connection.query(`INSERT INTO \`${name}\` (row_no, id, data) VALUES ?`, [
          rows.map((row, index) => [
            index,
            row && row.id ? String(row.id).slice(0, 64) : null,
            JSON.stringify(row),
          ]),
        ]);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error(`[MySQL] Gagal menyimpan tabel ${name}: ${error.message}`);
    } finally {
      connection.release();
    }
  });
  return writeQueue;
}

/** Dipanggil sekali saat start: buat database/tabel lalu muat data ke memori. */
async function init() {
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch {
    throw new Error('Paket mysql2 belum terpasang. Jalankan: npm install (di folder Back end).');
  }

  const { name: databaseName, ...connectionConfig } = config.database;
  const bootstrap = await mysql.createConnection(connectionConfig);
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4`);
  await bootstrap.end();

  pool = mysql.createPool({ ...connectionConfig, database: databaseName, connectionLimit: 5 });
  await pool.query('CREATE TABLE IF NOT EXISTS `_seeded` (name VARCHAR(64) PRIMARY KEY)');
  const [seeded] = await pool.query('SELECT name FROM `_seeded`');

  for (const name of COLLECTIONS) {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS \`${name}\` (row_no INT NOT NULL PRIMARY KEY, id VARCHAR(64) NULL, data JSON NOT NULL, INDEX idx_id (id)) CHARACTER SET utf8mb4`,
    );
    if (seeded.some((row) => row.name === name)) {
      const [rows] = await pool.query(`SELECT data FROM \`${name}\` ORDER BY row_no`);
      cache[name] = rows.map((row) => (typeof row.data === 'string' ? JSON.parse(row.data) : row.data));
    } else {
      cache[name] = loadSeed(name);
      await persist(name);
      await pool.query('INSERT IGNORE INTO `_seeded` (name) VALUES (?)', [name]);
    }
  }
  console.log(`[MySQL] Terhubung ke database "${databaseName}" di ${config.database.host}:${config.database.port}`);
}

/** Salinan data koleksi; mengubah hasilnya tidak mengubah cache. */
function read(name) {
  if (!cache[name]) throw new Error(`Database belum siap atau koleksi "${name}" tidak dikenal.`);
  return clone(cache[name]);
}

/** Mengganti seluruh isi koleksi, lalu menyimpannya ke MySQL di latar belakang. */
function write(name, rows) {
  if (!cache[name]) throw new Error(`Database belum siap atau koleksi "${name}" tidak dikenal.`);
  cache[name] = clone(rows);
  persist(name);
}

/** Menunggu semua penulisan yang masih antre selesai (dipakai skrip dan saat shutdown). */
function flush() {
  return writeQueue;
}

async function close() {
  await flush();
  if (pool) await pool.end();
}

module.exports = { COLLECTIONS, init, read, write, flush, close };
