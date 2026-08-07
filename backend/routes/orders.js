const express = require('express');
const router = express.Router();

// CREATE a customer order (public - no login required)
// Expects: { branch_id, payment_method, customer_name, customer_phone, items: [{ product_id, quantity }] }
router.post('/', (req, res) => {
  const db = req.app.get('db');
  const { branch_id, payment_method, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must have at least one item' });
  }

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

    // staff_id is NULL since this is a customer self-order, not staff-generated
    const billSql =
      'INSERT INTO bills (staff_id, branch_id, total_amount, payment_method, payment_status) VALUES (NULL, ?, ?, ?, ?)';
    db.query(billSql, [branch_id || null, total, payment_method || 'cash', 'paid'], (err, billResult) => {
      if (err) return res.status(500).json({ error: err.message });

      const bill_id = billResult.insertId;
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
          message: 'Order placed successfully',
        });
      });
    });
  });
});

module.exports = router;