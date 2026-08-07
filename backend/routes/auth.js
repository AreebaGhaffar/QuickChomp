const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// REGISTER a new staff/admin (ADMIN ONLY - used by admin to add staff members)
router.post('/register', verifyToken, verifyAdmin, async (req, res) => {
  const db = req.app.get('db');
  const { name, email, password, role, salary } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO staff (name, email, password, role, salary) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, email, hashedPassword, role || 'staff', salary || 0], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Email already registered' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: result.insertId, name, email, role: role || 'staff' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', (req, res) => {
  const db = req.app.get('db');
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.query('SELECT * FROM staff WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });
});

// GET all staff members (ADMIN ONLY) - for staff & payroll management
router.get('/staff', verifyToken, verifyAdmin, (req, res) => {
  const db = req.app.get('db');
  db.query('SELECT id, name, email, role, salary, created_at FROM staff ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// UPDATE staff salary/role (ADMIN ONLY)
router.put('/staff/:id', verifyToken, verifyAdmin, (req, res) => {
  const db = req.app.get('db');
  const { salary, role } = req.body;
  const sql = 'UPDATE staff SET salary = ?, role = ? WHERE id = ?';
  db.query(sql, [salary, role, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Staff record updated successfully' });
  });
});

// DELETE staff member (ADMIN ONLY)
router.delete('/staff/:id', verifyToken, verifyAdmin, (req, res) => {
  const db = req.app.get('db');
  db.query('DELETE FROM staff WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Staff member removed successfully' });
  });
});

// MARK attendance for a staff member on a given date (ADMIN ONLY)
// Expects: { staff_id, date, status }
router.post('/attendance', verifyToken, verifyAdmin, (req, res) => {
  const db = req.app.get('db');
  const { staff_id, date, status } = req.body;

  if (!staff_id || !date || !status) {
    return res.status(400).json({ error: 'staff_id, date, and status are required' });
  }

  // "Upsert" - if attendance for this staff+date already exists, update it instead of erroring
  const sql = `
    INSERT INTO attendance (staff_id, date, status)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE status = VALUES(status)
  `;
  db.query(sql, [staff_id, date, status], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Attendance recorded' });
  });
});

// GET attendance records for a specific staff member (ADMIN ONLY)
router.get('/attendance/:staff_id', verifyToken, verifyAdmin, (req, res) => {
  const db = req.app.get('db');
  const sql = 'SELECT * FROM attendance WHERE staff_id = ? ORDER BY date DESC LIMIT 31';
  db.query(sql, [req.params.staff_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;