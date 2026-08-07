require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Make db available to all route files
app.set('db', db);

// Routes
const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const billsRouter = require('./routes/bills');
app.use('/api/bills', billsRouter);

const dashboardRouter = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRouter);

const branchesRouter = require('./routes/branches');
app.use('/api/branches', branchesRouter);

const ordersRouter = require('./routes/orders');
app.use('/api/orders', ordersRouter);

// Test route
app.get('/', (req, res) => {
  res.send('QuickChomp API is running');
});

// Test database connection
db.query('SELECT 1', (err) => {
  if (err) {
    console.error('Database connection FAILED:', err.message);
  } else {
    console.log('Database connected successfully');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});