const express = require('express');
const router = express.Router();
const db = require('../../core/database');

// GET: Ambil daftar template produk milik retailer
router.get('/', async (req, res, next) => {
  try {
    const retailerId = req.user.id;
    const query = `SELECT * FROM product_templates WHERE retailer_id = ? ORDER BY created_at DESC`;
    const templates = await db.query(query, [retailerId]);
    res.json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
});

// POST: Simpan template produk baru
router.post('/', async (req, res, next) => {
  try {
    const retailerId = req.user.id;
    const { name, category_id, original_price, discounted_price, description } = req.body;
    
    const query = `
      INSERT INTO product_templates (retailer_id, name, category_id, original_price, discounted_price, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const result = await db.query(query, [retailerId, name, category_id, original_price, discounted_price, description]);
    
    res.status(201).json({ 
      success: true, 
      message: 'Template produk berhasil disimpan', 
      data: { id: result.insertId, ...req.body } 
    });
  } catch (error) {
    next(error);
  }
});

// DELETE: Hapus template produk
router.delete('/:id', async (req, res, next) => {
  try {
    const templateId = req.params.id;
    const retailerId = req.user.id;
    
    const query = `DELETE FROM product_templates WHERE id = ? AND retailer_id = ?`;
    await db.query(query, [templateId, retailerId]);
    
    res.json({ success: true, message: 'Template produk berhasil dihapus' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;