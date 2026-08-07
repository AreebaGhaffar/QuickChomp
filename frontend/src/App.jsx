import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';

function App() {
  return (
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
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;