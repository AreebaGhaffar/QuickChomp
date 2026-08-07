import { useEffect, useState } from 'react';
import api from '../api/axios';

function AdminBilling() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // [{ product_id, name, price, quantity }]
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [message, setMessage] = useState('');
  const [lastBill, setLastBill] = useState(null);

  useEffect(() => {
    api.get('/products').then((res) => setProducts(res.data));
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQuantity = (product_id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product_id === product_id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (product_id) => {
    setCart((prev) => prev.filter((item) => item.product_id !== product_id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleGenerateBill = async () => {
    if (cart.length === 0) {
      setMessage('Cart is empty');
      return;
    }
    setMessage('');
    try {
      const res = await api.post('/bills', {
        payment_method: paymentMethod,
        items: cart.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
      });
      setLastBill(res.data);
      setCart([]);
      setMessage('Bill generated successfully!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to generate bill');
    }
  };

  return (
    <div style={{ padding: '30px', display: 'flex', gap: '30px' }}>
      {/* Product Selection */}
      <div style={{ flex: 2 }}>
        <h2>New Bill</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px',
          }}
        >
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              style={{
                padding: '15px 10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                background: '#fff',
                textAlign: 'center',
              }}
            >
              <div>{product.name}</div>
              <div style={{ color: '#e63946', fontWeight: 'bold' }}>${product.price}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart / Bill Summary */}
      <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '30px' }}>
        <h3>Current Order</h3>
        {cart.length === 0 ? (
          <p style={{ color: '#888' }}>No items yet — click a product to add it.</p>
        ) : (
          <div>
            {cart.map((item) => (
              <div
                key={item.product_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <div>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>${item.price} each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => updateQuantity(item.product_id, -1)} style={{ cursor: 'pointer' }}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, 1)} style={{ cursor: 'pointer' }}>
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    style={{ cursor: 'pointer', color: 'red', marginLeft: '8px' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <hr />
            <h3>Total: ${total.toFixed(2)}</h3>
          </div>
        )}

        <label style={{ display: 'block', margin: '15px 0 5px' }}>Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="wallet">Wallet</option>
        </select>

        <button
          onClick={handleGenerateBill}
          style={{
            width: '100%',
            padding: '12px',
            background: '#e63946',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Generate Bill
        </button>

        {message && (
          <p style={{ color: message.includes('success') ? 'green' : 'red', marginTop: '10px' }}>{message}</p>
        )}

        {lastBill && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f8f8', borderRadius: '8px' }}>
            <strong>Bill #{lastBill.bill_id}</strong>
            <p>Total: ${lastBill.total_amount}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBilling;