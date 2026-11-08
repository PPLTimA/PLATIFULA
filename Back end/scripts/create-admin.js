// Membuat admin pertama dari environment variable (admin tidak bisa mendaftar lewat form publik).
//   PLATIFUL_ADMIN_EMAIL, PLATIFUL_ADMIN_NAME, PLATIFUL_ADMIN_PASSWORD (min. 12 karakter)
const { randomUUID } = require('node:crypto');
const db = require('../src/core/database');
const { isEmail } = require('../src/core/validate');
const { hashPassword } = require('../src/modules/auth/auth.service');

async function createInitialAdmin() {
  const email = String(process.env.PLATIFUL_ADMIN_EMAIL || '').trim().toLowerCase();
  const name = String(process.env.PLATIFUL_ADMIN_NAME || '').trim();
  const password = String(process.env.PLATIFUL_ADMIN_PASSWORD || '');

  if (!email || !name || password.length < 12) {
    throw new Error('Set PLATIFUL_ADMIN_EMAIL, PLATIFUL_ADMIN_NAME, dan PLATIFUL_ADMIN_PASSWORD (minimal 12 karakter).');
  }
  if (!isEmail(email)) throw new Error('PLATIFUL_ADMIN_EMAIL harus berupa alamat email yang valid.');

  await db.init();
  const users = db.read('users');
  if (users.some((user) => user.email === email)) throw new Error('Email tersebut sudah punya akun.');

  users.push({ id: randomUUID(), name, email, role: 'admin', ...hashPassword(password) });
  db.write('users', users);
  await db.close();
}

createInitialAdmin()
  .then(() => console.log('Akun admin dibuat. Hapus variabel password dari environment sekarang.'))
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
