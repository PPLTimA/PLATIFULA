const { randomUUID } = require('node:crypto');
const db = require('../../core/database');
const { nowIso } = require('../../core/time');

/** Mengirim notifikasi yang sama ke banyak user sekaligus (satu kali tulis). */
function notifyMany(userIds, message) {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (!ids.length) return;
  const notifications = db.read('notifications');
  const createdAt = nowIso();
  ids.forEach((userId) => {
    notifications.unshift({ id: randomUUID(), userId, message, read: false, createdAt });
  });
  db.write('notifications', notifications);
}

const notify = (userId, message) => notifyMany([userId], message);

module.exports = { notify, notifyMany };
