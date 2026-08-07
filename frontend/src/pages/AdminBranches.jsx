import { useEffect, useState } from 'react';
import api from '../api/axios';

function AdminBranches() {
  const [branches, setBranches] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadBranches = () => {
    api.get('/branches').then((res) => setBranches(res.data));
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const resetForm = () => {
    setName('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const data = { name, address, latitude: latitude || null, longitude: longitude || null };

    try {
      if (editingId) {
        await api.put(`/branches/${editingId}`, data);
        setMessage('Branch updated');
      } else {
        await api.post('/branches', data);
        setMessage('Branch added');
      }
      resetForm();
      loadBranches();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleEdit = (branch) => {
    setEditingId(branch.id);
    setName(branch.name);
    setAddress(branch.address);
    setLatitude(branch.latitude || '');
    setLongitude(branch.longitude || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this branch?')) return;
    await api.delete(`/branches/${id}`);
    loadBranches();
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2>Manage Branches</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', maxWidth: '400px' }}>
        <h3>{editingId ? 'Edit Branch' : 'Add New Branch'}</h3>
        <input
          type="text"
          placeholder="Branch name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <input
          type="text"
          placeholder="Latitude (optional)"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <input
          type="text"
          placeholder="Longitude (optional)"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        {message && <p>{message}</p>}
        <button type="submit" style={{ padding: '8px 16px', marginRight: '8px', cursor: 'pointer' }}>
          {editingId ? 'Update' : 'Add'} Branch
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </form>

      <h3>All Branches</h3>
      {branches.map((b) => (
        <div
          key={b.id}
          style={{
            border: '1px solid #eee',
            borderRadius: '6px',
            padding: '10px',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <strong>{b.name}</strong>
            <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>{b.address}</p>
          </div>
          <div>
            <button onClick={() => handleEdit(b)} style={{ marginRight: '8px', cursor: 'pointer' }}>
              Edit
            </button>
            <button onClick={() => handleDelete(b.id)} style={{ cursor: 'pointer' }}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminBranches;