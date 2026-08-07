const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

// CREATE a new bill (staff generates this when customer orders)
// Expects: { staff_id, branch_id, payment_method, items: [{ product_id, quantity }] }
router.post('/', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const { branch_id, payment_method, items } = req.body;
  const staff_id = req.user.id; // from logged-in token

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Bill must have at least one item' });
  }

  // Get current prices for all products in the bill
  const productIds = items.map((i) => i.product_id);
  const placeholders = productIds.map(() => '?').join(',');

  db.query(`SELECT id, price FROM products WHERE id IN (${placeholders})`, productIds, (err, products) => {
    if (err) return res.status(500).json({ error: err.message });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'One or more products not found' });
    }

    const priceMap = {};
    products.forEach((p) => (priceMap[p.id] = parseFloat(p.price)));

    let total = 0;
    const billItemsData = items.map((item) => {
      const unit_price = priceMap[item.product_id];
      const subtotal = unit_price * item.quantity;
      total += subtotal;
      return { ...item, unit_price, subtotal };
    });

    // Insert the bill first
    const billSql = 'INSERT INTO bills (staff_id, branch_id, total_amount, payment_method, payment_status) VALUES (?, ?, ?, ?, ?)';
    db.query(billSql, [staff_id, branch_id || null, total, payment_method || 'cash', 'paid'], (err, billResult) => {
      if (err) return res.status(500).json({ error: err.message });

      const bill_id = billResult.insertId;

      // Insert all bill items (this is what feeds product-wise sales tracking)
      const itemValues = billItemsData.map((item) => [
        bill_id,
        item.product_id,
        item.quantity,
        item.unit_price,
        item.subtotal,
      ]);

      const itemsSql = 'INSERT INTO bill_items (bill_id, product_id, quantity, unit_price, subtotal) VALUES ?';
      db.query(itemsSql, [itemValues], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({
          bill_id,
          total_amount: total,
          items: billItemsData,
          message: 'Bill created successfully',
        });
      });
    });
  });
});

// GET all bills (for viewing order history)
router.get('/', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const sql = `
    SELECT bills.*, staff.name AS staff_name, branches.name AS branch_name
    FROM bills
    LEFT JOIN staff ON bills.staff_id = staff.id
    LEFT JOIN branches ON bills.branch_id = branches.id
    ORDER BY bills.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET single bill with its items (receipt view)
router.get('/:id', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  db.query('SELECT * FROM bills WHERE id = ?', [id], (err, bills) => {
    if (err) return res.status(500).json({ error: err.message });
    if (bills.length === 0) return res.status(404).json({ error: 'Bill not found' });

    const itemsSql = `
      SELECT bill_items.*, products.name AS product_name
      FROM bill_items
      JOIN products ON bill_items.product_id = products.id
      WHERE bill_items.bill_id = ?
    `;
    db.query(itemsSql, [id], (err, items) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ...bills[0], items });
    });
  });
});

module.exports = router;