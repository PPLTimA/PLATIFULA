
const { createHash, randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
const config = require('../../config');
const db = require('../../core/database');

const { cookieName, durationMs, secureCookie } = config.session;
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return { salt, passwordHash: scryptSync(password, salt, 64).toString('hex') };
}

function verifyPassword(password, user) {
  if (!user?.salt || !user?.passwordHash) return false;
  const actual = scryptSync(password, user.salt, 64);
  const saved = Buffer.from(user.passwordHash, 'hex');
  return actual.length === saved.length && timingSafeEqual(actual, saved);
}

/** Data user yang aman dikirim ke browser (tanpa hash password). */
function publicUser(user) {
  const { id, name, email, role, store } = user;
  return {
    id, name, email, role,
    ...(store ? { store } : {}),
    ...(role === 'retailer' ? { verification: user.verification?.status || 'none' } : {}),
  };
}

function readToken(request) {
  return request.headers.cookie?.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`))?.[1] || null;
}

function cookieHeader(value, maxAgeSeconds) {
  return `${cookieName}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}${secureCookie ? '; Secure' : ''}`;
}

/** Membuat sesi baru dan mengembalikan header Set-Cookie-nya. */
function createSession(userId) {
  const token = randomBytes(32).toString('hex');
  const sessions = db.read('sessions').filter((session) => session.expiresAt >= Date.now());
  sessions.push({ tokenHash: sha256(token), userId, expiresAt: Date.now() + durationMs });
  db.write('sessions', sessions);
  return cookieHeader(token, Math.floor(durationMs / 1000));
}

function destroySession(request) {
  const token = readToken(request);
  if (token) {
    const tokenHash = sha256(token);
    db.write('sessions', db.read('sessions').filter((session) => session.tokenHash !== tokenHash));
  }
  return cookieHeader('', 0);
}

function destroyUserSessions(userId) {
  db.write('sessions', db.read('sessions').filter((session) => session.userId !== userId));
}

/** User dari cookie sesi, atau null bila belum login, sesi kedaluwarsa, atau akun disuspend. */
function getUserFromRequest(request) {
  const token = readToken(request);
  if (!token) return null;

  const tokenHash = sha256(token);
  const sessions = db.read('sessions');
  const session = sessions.find((item) => item.tokenHash === tokenHash);
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    db.write('sessions', sessions.filter((item) => item !== session && item.tokenHash !== tokenHash));
    return null;
  }

  const user = db.read('users').find((account) => account.id === session.userId);
  return user && !user.suspended ? user : null;
}

module.exports = {
  createSession,
  destroySession,
  destroyUserSessions,
  getUserFromRequest,
  hashPassword,
  publicUser,
  verifyPassword,
};
