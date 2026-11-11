
const db = require('../../../../core/database');

function register(router) {
  router.get('/api/notifications', (ctx) => {
    ctx.json(200, db.read('notifications').filter((item) => item.userId === ctx.user.id));
  });

  // Tandai semua notifikasi milik user sebagai dibaca.
  router.post('/api/notifications/read-all', (ctx) => {
    db.write('notifications', db.read('notifications').map((item) => (
      item.userId === ctx.user.id && !item.read ? { ...item, read: true } : item)));
    ctx.json(200, { ok: true });
  });

  router.patch('/api/notifications/:id', (ctx) => {
    db.write('notifications', db.read('notifications').map((item) => (
      item.id === ctx.params.id && item.userId === ctx.user.id ? { ...item, read: true } : item)));
    ctx.json(200, { ok: true });
  });

  router.delete('/api/notifications/:id', (ctx) => {
    db.write('notifications', db.read('notifications')
      .filter((item) => !(item.id === ctx.params.id && item.userId === ctx.user.id)));
    ctx.json(200, { ok: true });
  });
}

module.exports = { register };
