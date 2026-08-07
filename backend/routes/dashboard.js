const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Overall summary: today, this week, this month totals
router.get('/summary', verifyToken, (req, res) => {
  const db = req.app.get('db');

  const sql = `
    SELECT
      (SELECT IFNULL(SUM(total_amount), 0) FROM bills WHERE DATE(created_at) = CURDATE()) AS today_sales,
      (SELECT IFNULL(SUM(total_amount), 0) FROM bills WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)) AS week_sales,
      (SELECT IFNULL(SUM(total_amount), 0) FROM bills WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())) AS month_sales,
      (SELECT COUNT(*) FROM bills WHERE DATE(created_at) = CURDATE()) AS today_orders,
      (SELECT COUNT(*) FROM bills WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)) AS week_orders,
      (SELECT COUNT(*) FROM bills WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())) AS month_orders
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// Daily sales trend (last 30 days) - for line chart
router.get('/daily', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const sql = `
    SELECT DATE(created_at) AS date, SUM(total_amount) AS total_sales, COUNT(*) AS order_count
    FROM bills
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Weekly sales trend (last 12 weeks)
router.get('/weekly', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const sql = `
    SELECT YEARWEEK(created_at, 1) AS week, SUM(total_amount) AS total_sales, COUNT(*) AS order_count
    FROM bills
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
    GROUP BY YEARWEEK(created_at, 1)
    ORDER BY week ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Monthly sales trend (last 12 months)
router.get('/monthly', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const sql = `
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(total_amount) AS total_sales, COUNT(*) AS order_count
    FROM bills
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Per-product sales performance (which item sold, how much, revenue)
router.get('/products', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const sql = `
    SELECT
      products.id,
      products.name,
      SUM(bill_items.quantity) AS units_sold,
      SUM(bill_items.subtotal) AS revenue
    FROM bill_items
    JOIN products ON bill_items.product_id = products.id
    GROUP BY products.id, products.name
    ORDER BY revenue DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;