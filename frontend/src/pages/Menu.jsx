import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

function Menu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, itemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Failed to load menu:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: 'center' }}>Loading menu...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <h2>Our Menu</h2>
        <button
          onClick={() => navigate('/checkout')}
          style={{
            padding: '10px 16px',
            background: '#e63946',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Cart ({itemCount})
        </button>
      </div>

      {products.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No products available yet.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            maxWidth: '900px',
            margin: '20px auto',
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center',
              }}
            >
              {product.image_url && (
                <img
                  src={`http://localhost:5000${product.image_url}`}
                  alt={product.name}
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px' }}
                />
              )}
              <h3>{product.name}</h3>
              <p style={{ color: '#e63946', fontWeight: 'bold' }}>${product.price}</p>
              <p style={{ fontSize: '12px', color: '#888' }}>{product.category_name}</p>
              <button
                onClick={() => addToCart(product)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '8px',
                  background: '#457b9d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Menu;