const { randomUUID } = require('node:crypto');
const db = require('../../core/database');
const { nowIso } = require('../../core/time');

const TYPES = ['info', 'order', 'success', 'review', 'verify', 'announce', 'warning'];


function notifyMany(userIds, message, { type = 'info', page = null } = {}) {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (!ids.length) return;
  const notifications = db.read('notifications');
  const createdAt = nowIso();
  ids.forEach((userId) => {
    notifications.unshift({
      id: randomUUID(), userId, message, type: TYPES.includes(type) ? type : 'info', page, read: false, createdAt,
    });
  });
  db.write('notifications', notifications);
}

const notify = (userId, message, options) => notifyMany([userId], message, options);

module.exports = { notify, notifyMany };