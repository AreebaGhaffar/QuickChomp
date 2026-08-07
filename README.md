# QuickChomp — Setup Guide

## Tech Stack
- Frontend: React.js (Vite)
- Backend: Node.js + Express.js
- Database: MySQL

## Prerequisites
- Node.js (v18 or higher)
- MySQL Server (v8 or higher)

## Setup Instructions

### 1. Database
1. Open MySQL Workbench (or any MySQL client)
2. Create a database named `quickchomp`
3. Run the SQL script in `database/quickchomp_schema.sql` to create all tables

### 2. Backend
```
cd backend
npm install
```
Create a `.env` file in the `backend` folder with:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=quickchomp
DB_PORT=3306
JWT_SECRET=your_secret_key_here
PORT=5000
```
Then run:
```
node server.js
```
Backend runs on `http://localhost:5000`

### 3. Frontend
```
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## Default Admin Login
- Email: admin@quickchomp.com
- Password: admin123
(Change this password after first login for security)

## Project Structure
```
QuickChomp/
├── backend/
│   ├── routes/          (API endpoints: products, auth, bills, dashboard, branches)
│   ├── middleware/       (JWT authentication)
│   ├── uploads/          (product images)
│   └── server.js         (main server file)
├── frontend/
│   └── src/
│       ├── pages/         (all page components)
│       ├── components/    (reusable components)
│       └── api/           (backend connection setup)
└── database/
    └── quickchomp_schema.sql
```

## Features Included
- Public menu with categories, images, prices
- Branch/location listing (public) with admin management
- Staff/admin secure login (JWT-based)
- Admin product management (add/edit/delete, image upload)
- Staff billing screen (generates bills, auto-feeds sales data)
- Sales analytics dashboard (daily/weekly/monthly trends, per-product performance)

## Notes for Future Development
- Payment gateway (Stripe/JazzCash) integration is not yet wired up — billing currently marks orders as "paid" directly. This would be the next step to add live payments.
- Staff attendance/payroll tracking has a `salary` field in the database but no dedicated UI yet.
