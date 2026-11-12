const express = require('express');
const router = express.Router();
const productsService = require('./products.service');

// GET: Ambil semua produk milik retailer yang sedang login
router.get('/retailer', async (req, res, next) => {
  try {
    const retailerId = req.user.id;
    const products = await productsService.getProductsByRetailer(retailerId);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

// POST: Tambah produk surplus baru (Posting)
router.post('/', async (req, res, next) => {
  try {
    const retailerId = req.user.id;
    const newProduct = await productsService.createProduct(retailerId, req.body);
    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan', data: newProduct });
  } catch (error) {
    next(error);
  }
});

// PUT: Ubah data produk
router.put('/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;
    const retailerId = req.user.id;
    const updated = await productsService.updateProduct(productId, retailerId, req.body);
    res.json({ success: true, message: 'Produk berhasil diperbarui', data: updated });
  } catch (error) {
    next(error);
  }
});

// PATCH: Nonaktifkan / Ubah Status Produk
router.patch('/:id/status', async (req, res, next) => {
  try {
    const productId = req.params.id;
    const retailerId = req.user.id;
    const { status } = req.body; // e.g. 'active', 'inactive'
    const updated = await productsService.toggleProductStatus(productId, retailerId, status);
    res.json({ success: true, message: 'Status produk berhasil diubah', data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE: Hapus produk
router.delete('/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;
    const retailerId = req.user.id;
    await productsService.deleteProduct(productId, retailerId);
    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;