import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../api/axios';

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/dashboard/daily'),
      api.get('/dashboard/weekly'),
      api.get('/dashboard/monthly'),
      api.get('/dashboard/products'),
    ])
      .then(([summaryRes, dailyRes, weeklyRes, monthlyRes, productsRes]) => {
        setSummary(summaryRes.data);
        setDaily(dailyRes.data);
        setWeekly(weeklyRes.data);
        setMonthly(monthlyRes.data);
        setProductSales(productsRes.data);
      })
      .catch((err) => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '30px' }}>Loading dashboard...</p>;

  const cardStyle = {
    background: '#f8f8f8',
    borderRadius: '8px',
    padding: '20px',
    flex: 1,
    textAlign: 'center',
  };

  const tabStyle = (tab) => ({
    padding: '8px 16px',
    cursor: 'pointer',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid #e63946' : '3px solid transparent',
    background: 'transparent',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
  });

  const chartData = activeTab === 'daily' ? daily : activeTab === 'weekly' ? weekly : monthly;
  const xKey = activeTab === 'daily' ? 'date' : activeTab === 'weekly' ? 'week' : 'month';

  return (
    <div style={{ padding: '30px' }}>
      <h2>Sales Dashboard</h2>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={cardStyle}>
          <p style={{ color: '#888' }}>Today's Sales</p>
          <h3 style={{ color: '#e63946' }}>${summary.today_sales}</h3>
          <p style={{ fontSize: '12px' }}>{summary.today_orders} orders</p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: '#888' }}>This Week</p>
          <h3 style={{ color: '#e63946' }}>${summary.week_sales}</h3>
          <p style={{ fontSize: '12px' }}>{summary.week_orders} orders</p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: '#888' }}>This Month</p>
          <h3 style={{ color: '#e63946' }}>${summary.month_sales}</h3>
          <p style={{ fontSize: '12px' }}>{summary.month_orders} orders</p>
        </div>
      </div>

      {/* Trend Chart with Tabs */}
      <div style={{ borderBottom: '1px solid #eee', marginBottom: '15px' }}>
        <button style={tabStyle('daily')} onClick={() => setActiveTab('daily')}>Daily</button>
        <button style={tabStyle('weekly')} onClick={() => setActiveTab('weekly')}>Weekly</button>
        <button style={tabStyle('monthly')} onClick={() => setActiveTab('monthly')}>Monthly</button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="total_sales" stroke="#e63946" name="Sales ($)" />
        </LineChart>
      </ResponsiveContainer>

      {/* Per-Product Performance */}
      <h3 style={{ marginTop: '40px' }}>Product Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={productSales}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="units_sold" fill="#e63946" name="Units Sold" />
          <Bar dataKey="revenue" fill="#457b9d" name="Revenue ($)" />
        </BarChart>
      </ResponsiveContainer>

      {/* Product Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Product</th>
            <th style={{ padding: '8px' }}>Units Sold</th>
            <th style={{ padding: '8px' }}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {productSales.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{p.name}</td>
              <td style={{ padding: '8px' }}>{p.units_sold}</td>
              <td style={{ padding: '8px' }}>${p.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;