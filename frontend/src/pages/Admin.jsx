import { useNavigate, Link, Outlet } from 'react-router-dom';

function Admin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh' }}>
      <aside style={{ width: '200px', borderRight: '1px solid #eee', padding: '20px' }}>
        <h3>Welcome, {user.name || 'Admin'}</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <Link to="/admin/products">Products</Link>
          <button onClick={handleLogout} style={{ padding: '8px', cursor: 'pointer', marginTop: '20px' }}>
            Logout
          </button>
        </nav>
      </aside>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Admin;