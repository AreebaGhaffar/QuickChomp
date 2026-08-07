import { useEffect, useState } from 'react';
import api from '../api/axios';

function Menu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <h2 style={{ textAlign: 'center' }}>Our Menu</h2>
      {products.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No products available yet.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            maxWidth: '900px',
            margin: '0 auto',
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Menu;