import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

function Checkout() {
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [placing, setPlacing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    setError('');
    try {
      const res = await api.post('/orders', {
        payment_method: paymentMethod,
        items: cart.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
      });
      setOrderResult(res.data);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (orderResult) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center', padding: '20px' }}>
        <h2 style={{ color: 'green' }}>Order Placed!</h2>
        <p>Order #{orderResult.bill_id}</p>
        <p>Total: ${orderResult.total_amount}</p>
        <p style={{ color: '#888', fontSize: '14px' }}>
          Payment processed in test mode (no live payment gateway connected yet).
        </p>
        <button
          onClick={() => navigate('/menu')}
          style={{ padding: '10px 20px', marginTop: '15px', cursor: 'pointer' }}
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px' }}>
      <h2>Checkout</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty. <a href="/menu">Go to menu</a></p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.product_id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}
            >
              <div>
                <div>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>${item.price} each</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => updateQuantity(item.product_id, -1)} style={{ cursor: 'pointer' }}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product_id, 1)} style={{ cursor: 'pointer' }}>+</button>
                <button onClick={() => removeFromCart(item.product_id)} style={{ cursor: 'pointer', color: 'red' }}>✕</button>
              </div>
            </div>
          ))}

          <hr />
          <h3>Total: ${total.toFixed(2)}</h3>

          <label style={{ display: 'block', margin: '15px 0 5px' }}>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
          >
            <option value="cash">Cash on Delivery</option>
            <option value="card">Card (test mode)</option>
            <option value="wallet">Wallet (test mode)</option>
          </select>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
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
            {placing ? 'Placing Order...' : 'Place Order'}
          </button>
        </>
      )}
    </div>
  );
}

export default Checkout;