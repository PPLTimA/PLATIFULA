// MySQL tiruan (di memori) supaya `npm test` bisa jalan tanpa XAMPP dan tanpa menyentuh database asli.
// Hanya mendukung query yang dipakai oleh src/core/database.js.
const tables = new Map(); // nama tabel -> array baris { row_no, id, data }
let seeded = new Set();

const tableOf = (sql) => /`([^`]+)`/.exec(sql)?.[1];

async function query(sql, params = []) {
  const text = sql.replace(/\s+/g, ' ').trim();
  if (/^CREATE DATABASE/i.test(text)) return [[]];
  if (/^CREATE TABLE IF NOT EXISTS `_seeded`/i.test(text)) return [[]];
  if (/^CREATE TABLE IF NOT EXISTS/i.test(text)) {
    const name = tableOf(text);
    if (!tables.has(name)) tables.set(name, []);
    return [[]];
  }
  if (/^SELECT name FROM `_seeded`/i.test(text)) return [[...seeded].map((name) => ({ name }))];
  if (/^INSERT IGNORE INTO `_seeded`/i.test(text)) { seeded.add(params[0]); return [[]]; }
  if (/^SELECT data FROM/i.test(text)) {
    return [[...tables.get(tableOf(text))].sort((a, b) => a.row_no - b.row_no).map((row) => ({ data: row.data }))];
  }
  if (/^DELETE FROM/i.test(text)) { tables.set(tableOf(text), []); return [[]]; }
  if (/^INSERT INTO/i.test(text)) {
    const name = tableOf(text);
    params[0].forEach(([row_no, id, data]) => tables.get(name).push({ row_no, id, data }));
    return [[]];
  }
  throw new Error(`Query tidak didukung oleh mock: ${text}`);
}

const connection = {
  query,
  end: async () => {},
  beginTransaction: async () => {},
  commit: async () => {},
  rollback: async () => {},
  release: () => {},
};

module.exports = {
  createConnection: async () => connection,
  createPool: () => ({ query, getConnection: async () => connection, end: async () => {} }),
  reset() { tables.clear(); seeded = new Set(); },
};
