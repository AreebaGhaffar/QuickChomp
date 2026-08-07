const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// GET all branches (public - customers need to see this)
router.get('/', (req, res) => {
  const db = req.app.get('db');
  db.query('SELECT * FROM branches', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// CREATE branch (ADMIN ONLY)
router.post('/', verifyToken, verifyAdmin, (req, res) => {
  const db = req.app.get('db');
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address) {
    return res.status(400).json({ error: 'Name and address are required' });
  }

  const sql = 'INSERT INTO branches (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, address, latitude || null, longitude || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, name, address });
  });
});

// UPDATE branch (ADMIN ONLY)
router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
  const db = req.app.get('db');
  const { name, address, latitude, longitude } = req.body;
  const sql = 'UPDATE branches SET name = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?';
  db.query(sql, [name, address, latitude || null, longitude || null, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Branch updated successfully' });
  });
});

// DELETE branch (ADMIN ONLY)
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  const db = req.app.get('db');
  db.query('DELETE FROM branches WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Branch deleted successfully' });
  });
});

module.exports = router;