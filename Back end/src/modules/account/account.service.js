// Menghapus akun beserta data turunannya, dipakai oleh hapus akun sendiri dan hapus akun oleh admin.
const db = require('../../core/database');
const { destroyUserSessions } = require('../auth/auth.service');
const { notify } = require('../notifications/notifications.service');
const { STATUS, isOpen, restoreStock } = require('../orders/orders.service');

function removeUserCascade(userId) {
  const users = db.read('users');
  const target = users.find((account) => account.id === userId);
  if (!target) return;

  // Pesanan berjalan dibatalkan; stok dikembalikan dan pihak lawan diberi tahu.
  const orders = db.read('orders');
  orders.filter((order) => isOpen(order) && (order.customerId === userId || order.storeId === userId))
    .forEach((order) => {
      order.status = STATUS.CANCELLED;
      if (order.storeId !== userId) restoreStock(order);
      const counterpart = order.customerId === userId ? order.storeId : order.customerId;
      notify(counterpart, `Pesanan ${order.productName} dibatalkan karena akun terkait dihapus.`);
    });
  db.write('orders', orders);

  db.write('products', db.read('products').filter((product) => product.storeId !== userId));
  db.write('templates', db.read('templates').filter((template) => template.ownerId !== userId));
  db.write('notifications', db.read('notifications').filter((item) => item.userId !== userId));
  destroyUserSessions(userId);

  const remaining = users.filter((account) => account.id !== userId);
  remaining.forEach((account) => {
    if (account.favorites?.includes(userId)) {
      account.favorites = account.favorites.filter((id) => id !== userId);
    }
  });
  db.write('users', remaining);
}

module.exports = { removeUserCascade };
