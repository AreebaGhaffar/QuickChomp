import { useEffect, useState } from 'react';
import api from '../api/axios';

function Locations() {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    api.get('/branches').then((res) => setBranches(res.data));
  }, []);

  return (
    <div style={{ padding: '30px', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Our Locations</h2>
      {branches.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>No branches added yet.</p>
      ) : (
        branches.map((b) => (
          <div
            key={b.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
            }}
          >
            <h3>{b.name}</h3>
            <p>{b.address}</p>
            {b.latitude && b.longitude && (
              <a
                href={`https://www.google.com/maps?q=${b.latitude},${b.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#e63946' }}
              >
                View on Map
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Locations;