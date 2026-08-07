const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Configure image upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// GET all products (public - customers need to browse the menu)
router.get('/', (req, res) => {
  const db = req.app.get('db');
  const sql = `
    SELECT products.*, categories.name AS category_name
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET single product by id (public)
router.get('/:id', (req, res) => {
  const db = req.app.get('db');
  db.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(results[0]);
  });
});

// POST create new product (ADMIN ONLY)
router.post('/', verifyToken, verifyAdmin, upload.single('image'), (req, res) => {
  const db = req.app.get('db');
  const { name, price, category_id } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = 'INSERT INTO products (name, price, category_id, image_url) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, price, category_id || null, image_url], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, name, price, category_id, image_url });
  });
});

// PUT update product (ADMIN ONLY)
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), (req, res) => {
  const db = req.app.get('db');
  const { name, price, category_id, is_available } = req.body;
  const { id } = req.params;

  // FormData sends booleans as the strings "true"/"false" - convert to 1/0 for MySQL
  const availableValue = is_available === undefined || is_available === 'true' || is_available === true ? 1 : 0;

  let sql = 'UPDATE products SET name = ?, price = ?, category_id = ?, is_available = ?';
  const params = [name, price, category_id || null, availableValue];

  if (req.file) {
    sql += ', image_url = ?';
    params.push(`/uploads/${req.file.filename}`);
  }

  sql += ' WHERE id = ?';
  params.push(id);

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product updated successfully' });
  });
});

// DELETE product (ADMIN ONLY)
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  const db = req.app.get('db');
  db.query('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product deleted successfully' });
  });
});

module.exports = router;