import { useEffect, useState } from 'react';
import api from '../api/axios';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadProducts = () => {
    api.get('/products').then((res) => setProducts(res.data));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategoryId('');
    setImage(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category_id', categoryId);
    if (image) formData.append('image', image);

    try {
      if (editingId) {
        formData.append('is_available', true);
        await api.put(`/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage('Product updated successfully');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage('Product added successfully');
      }
      resetForm();
      loadProducts();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setCategoryId(product.category_id || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2>Manage Products</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', maxWidth: '400px' }}>
        <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
        <input
          type="text"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <input
          type="number"
          placeholder="Category ID (1=Burgers, 2=Fries, 3=Drinks)"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ width: '100%', marginBottom: '8px' }}
        />
        {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
        <button type="submit" style={{ padding: '8px 16px', marginRight: '8px', cursor: 'pointer' }}>
          {editingId ? 'Update' : 'Add'} Product
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </form>

      <h3>All Products</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Name</th>
            <th style={{ padding: '8px' }}>Price</th>
            <th style={{ padding: '8px' }}>Category</th>
            <th style={{ padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{p.name}</td>
              <td style={{ padding: '8px' }}>${p.price}</td>
              <td style={{ padding: '8px' }}>{p.category_name || '-'}</td>
              <td style={{ padding: '8px' }}>
                <button onClick={() => handleEdit(p)} style={{ marginRight: '8px', cursor: 'pointer' }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(p.id)} style={{ cursor: 'pointer' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminProducts;
