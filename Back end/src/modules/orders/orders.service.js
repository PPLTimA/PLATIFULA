// Aturan status pesanan dan operasi stok.
const db = require('../../core/database');

const STATUS = {
  AWAITING: 'Awaiting pickup',
  READY: 'Ready for pickup',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
};

/** Pesanan yang masih berjalan (belum selesai/batal/no-show). */
const isOpen = (order) => [STATUS.AWAITING, STATUS.READY].includes(order.status);

/** Mengembalikan stok sebuah pesanan ke produknya (bila produk masih ada). */
function restoreStock(order) {
  const products = db.read('products');
  const product = products.find((item) => item.id === order.productId);
  if (!product) return;
  product.quantity += order.quantity;
  db.write('products', products);
}

module.exports = { STATUS, isOpen, restoreStock };
