import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Admin from './pages/Admin';
import AdminProducts from './pages/AdminProducts';
import AdminDashboard from './pages/AdminDashboard';
import AdminBilling from './pages/AdminBilling';
import Locations from './pages/Locations';
import AdminBranches from './pages/AdminBranches';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <nav
          style={{
            display: 'flex',
            gap: '20px',
            padding: '15px 30px',
            borderBottom: '1px solid #eee',
            alignItems: 'center',
          }}
        >
          <strong style={{ color: '#e63946' }}>QuickChomp</strong>
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/locations">Locations</Link>
          <Link to="/login" style={{ marginLeft: 'auto' }}>
            Admin Login
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          >
            <Route path="products" element={<AdminProducts />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="billing" element={<AdminBilling />} />
            <Route path="branches" element={<AdminBranches />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;