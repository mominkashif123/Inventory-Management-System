import React, { useEffect, useState, useMemo } from 'react';
import authFetch from '../utils/authFetch';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Scatter, CartesianGrid } from 'recharts';
import { THS } from '../assets/index';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [inventoryValue, setInventoryValue] = useState(null);
  const [bestsellers, setBestsellers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAllLowStock, setShowAllLowStock] = useState(false);
  const [trendView, setTrendView] = useState('monthly'); // 'monthly' or 'yearly'
  const [last7DaysSales, setLast7DaysSales] = useState([]);

  // Month/year selection state
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-based
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Helper for month name
  const monthName = useMemo(() =>
    new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' }),
    [selectedMonth, selectedYear]
  );

  // Fetch sales trend for selected month/year or year
  useEffect(() => {
    setLoading(true);
    let trendUrl = '';
    if (trendView === 'monthly') {
      trendUrl = `http://localhost:5000/api/reports/recent-sales?month=${selectedMonth}&year=${selectedYear}`;
    } else {
      trendUrl = `http://localhost:5000/api/reports/recent-sales?year=${selectedYear}&view=yearly`;
    }
    Promise.all([
      authFetch('http://localhost:5000/api/reports/sales-summary').then(res => res.json()),
      authFetch('http://localhost:5000/api/reports/inventory-value').then(res => res.json()),
      authFetch('http://localhost:5000/api/reports/bestsellers').then(res => res.json()),
      authFetch('http://localhost:5000/api/reports/low-stock').then(res => res.json()),
      authFetch(trendUrl).then(res => res.json()),
      authFetch('http://localhost:5000/api/reports/recent-sales?last7=true').then(res => res.json())
    ]).then(([summaryRes, valueRes, bestsellersRes, lowStockRes, recentSalesRes, last7Res]) => {
      setSummary(summaryRes.data);
      setInventoryValue(valueRes.data);
      setBestsellers(bestsellersRes.data || []);
      setLowStock(lowStockRes.data || []);
      setRecentSales(recentSalesRes.data || []);
      setLast7DaysSales(last7Res.data || []);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load dashboard data');
      setLoading(false);
    });
  }, [selectedMonth, selectedYear, trendView]);

  // Handler for clicking an out-of-stock product
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  // Handler for updating product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const { id, name, quantity, value, description, part_number, type, location } = selectedProduct;
    await authFetch(`http://localhost:5000/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, quantity, value, description, part_number, type, location })
    });
    setShowUpdateModal(false);
    setSelectedProduct(null);
    // Refresh dashboard data
    window.location.reload();
  };

  if (loading) return <div className="text-center py-10 text-orange-600 font-bold">Loading dashboard...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  // Harley-Davidson style font fallback
  const harleyFont = 'Impact, Oswald, "Arial Black", sans-serif';

  // Prepare data for charts
  const productBreakdown = bestsellers.map(p => ({ name: p.name, value: p.total_sold }));
  // Only show products with quantity less than 2 in low stock alerts
  const lowStockFiltered = lowStock.filter(p => p.quantity < 1);
  const lowStockCritical = lowStockFiltered.filter(p => p.quantity <= 0);
  const lowStockWarning = lowStockFiltered.filter(p => p.quantity > 0);
  const pieColors = ['#ff6600', '#ff9900', '#ffcc00', '#ff3300', '#ffb347', '#ff7f50', '#ff4500'];
  const displayedLowStockWarning = lowStockWarning; // No slicing, show all

  // Prepare data for the graph
  const salesTrendData = trendView === 'monthly'
    ? recentSales.map(day => ({
        date: day.day,
        total: Number(day.total_sales)
      }))
    : recentSales.map(month => ({
        date: month.month,
        total: Number(month.total_sales)
      }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col">
        {/* Out of Stock Alert Section */}
        {lowStockCritical.length > 0 && (
          <div className="bg-red-900/90 border-l-4 border-red-500 rounded-xl shadow-lg px-6 py-4 mb-8 flex flex-col gap-2">
            <div className="text-lg font-bold text-red-200">Out of Stock Alert</div>
            <div className="flex flex-wrap gap-3">
              {lowStockCritical.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleProductClick(p)}
                  className="bg-red-700 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded shadow transition"
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="text-xs text-red-300 mt-2">Click a product to update its details.</div>
          </div>
        )}
        {/* Update Product Modal */}
        {showUpdateModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white text-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button onClick={() => setShowUpdateModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
              <h2 className="text-2xl font-bold mb-4 text-orange-700">Update Product</h2>
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Name</label>
                  <input type="text" className="w-full border rounded px-3 py-2" value={selectedProduct.name} onChange={e => setSelectedProduct({ ...selectedProduct, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block font-medium mb-1">Quantity</label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={selectedProduct.quantity} onChange={e => setSelectedProduct({ ...selectedProduct, quantity: e.target.value })} required />
                </div>
                <div>
                  <label className="block font-medium mb-1">Value</label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={selectedProduct.value} onChange={e => setSelectedProduct({ ...selectedProduct, value: e.target.value })} required />
                </div>
                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <input type="text" className="w-full border rounded px-3 py-2" value={selectedProduct.description} onChange={e => setSelectedProduct({ ...selectedProduct, description: e.target.value })} />
                </div>
                <div>
                  <label className="block font-medium mb-1">Part Number</label>
                  <input type="text" className="w-full border rounded px-3 py-2" value={selectedProduct.part_number} onChange={e => setSelectedProduct({ ...selectedProduct, part_number: e.target.value })} />
                </div>
                <div>
                  <label className="block font-medium mb-1">Type</label>
                  <input type="text" className="w-full border rounded px-3 py-2" value={selectedProduct.type} onChange={e => setSelectedProduct({ ...selectedProduct, type: e.target.value })} />
                </div>
                <div>
                  <label className="block font-medium mb-1">Location</label>
                  <input type="text" className="w-full border rounded px-3 py-2" value={selectedProduct.location} onChange={e => setSelectedProduct({ ...selectedProduct, location: e.target.value })} />
                </div>
                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition">Update Product</button>
              </form>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <img src={THS} alt="Harley-Davidson" className="h-12 w-auto" style={{ filter: 'drop-shadow(0 2px 8px #ff6600)' }} />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: harleyFont, letterSpacing: '2px' }}>
              THS Management System
            </h1>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <div className="bg-orange-700/90 rounded-xl shadow-lg px-6 py-4 text-center min-w-[140px]">
              <div className="text-xs uppercase tracking-widest text-orange-200">Total Sales</div>
              <div className="text-2xl font-bold">{summary?.total_sales || 0}</div>
            </div>
            <div className="bg-orange-700/90 rounded-xl shadow-lg px-6 py-4 text-center min-w-[140px]">
              <div className="text-xs uppercase tracking-widest text-orange-200">Revenue</div>
              <div className="text-2xl font-bold">${Number(summary?.total_revenue || 0).toLocaleString()}</div>
            </div>
            <div className="bg-orange-700/90 rounded-xl shadow-lg px-6 py-4 text-center min-w-[140px]">
              <div className="text-xs uppercase tracking-widest text-orange-200">Inventory Value</div>
              <div className="text-2xl font-bold">${Number(inventoryValue?.inventory_value || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-900/80 rounded-xl p-6 shadow-lg flex flex-col items-center">
            <div className="text-orange-400 text-lg font-bold mb-2">Top Products</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={productBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                  {productBreakdown.map((entry, idx) => <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <ul className="w-full space-y-1 mt-2">
              {bestsellers.length === 0 ? <li className="text-gray-400">No data</li> : bestsellers.map(p => (
                <li key={p.id} className="flex justify-between items-center text-sm">
                  <span>{p.name}</span>
                  <span className="font-bold text-orange-300">{p.total_sold}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-900/80 rounded-xl p-6 shadow-lg flex flex-col items-center">
            <div className="text-orange-400 text-lg font-bold mb-2">Out of Stock Alerts</div>
            <ul className="w-full space-y-1">
              {lowStockCritical.length === 0 && lowStockWarning.length === 0 ? <li className="text-gray-400">All good!</li> : null}
              {lowStockCritical.map(p => (
                <li key={p.id} className="flex justify-between items-center text-sm bg-red-900/70 text-red-300 rounded px-2 py-1 font-bold">
                  <span>{p.name}</span>
                  <span>Out of Stock</span>
                </li>
              ))}
              {displayedLowStockWarning.map(p => (
                <li key={p.id} className="flex justify-between items-center text-sm bg-orange-900/60 text-orange-200 rounded px-2 py-1">
                  <span>{p.name}</span>
                  <span>{parseInt(p.quantity, 10)}</span>
                </li>
              ))}
            </ul>
            {lowStockWarning.length > 3 && (
              null
            )}
          </div>
          <div className="bg-gray-900/80 rounded-xl p-6 shadow-lg flex flex-col items-center">
            <div className="text-orange-400 text-lg font-bold mb-2">Sales (Last 7 Days)</div>
            <ul className="w-full space-y-1 mt-2">
              {last7DaysSales.length === 0 ? <li className="text-gray-400">No data</li> : last7DaysSales.map(sale => (
                <li key={sale.id} className="flex justify-between items-center text-sm">
                  <span>{new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString()}</span>
                  <span className="font-bold text-orange-300">${sale.total}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-900/80 rounded-xl p-6 shadow-lg flex flex-col items-center">
            <div className="text-orange-400 text-lg font-bold mb-2">Monthly Revenue</div>
            <div className="text-3xl font-extrabold text-orange-200">${Number(summary?.total_revenue || 0).toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-2">(Current Month)</div>
          </div>
        </div>
        {/* Sales Chart Placeholder */}
        <div className="bg-gray-900/80 rounded-xl shadow-lg p-6 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <span className="text-orange-400 text-lg font-bold">
              Sales Trend ({trendView === 'monthly' ? `${monthName} ${selectedYear}` : `${selectedYear}`})
            </span>
            <div className="flex gap-2 items-center">
              {/* Trend view toggle */}
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="trendView"
                  value="monthly"
                  checked={trendView === 'monthly'}
                  onChange={() => setTrendView('monthly')}
                  className="appearance-none w-4 h-4 rounded-full border border-white bg-[#181c23] checked:bg-orange-500 checked:border-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="text-white text-sm">Monthly</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="trendView"
                  value="yearly"
                  checked={trendView === 'yearly'}
                  onChange={() => setTrendView('yearly')}
                  className="appearance-none w-4 h-4 rounded-full border border-white bg-[#181c23] checked:bg-orange-500 checked:border-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="text-white text-sm">Yearly</span>
              </label>
              <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className={`border border-white rounded px-2 py-1 bg-[#181c23] text-white focus:outline-none focus:ring-2 focus:ring-orange-400 ${trendView === 'yearly' ? 'hidden' : ''}`}>
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="border border-white rounded px-2 py-1 bg-[#181c23] text-white focus:outline-none focus:ring-2 focus:ring-orange-400">
                {[...Array(6)].map((_, i) => (
                  <option key={now.getFullYear() - i} value={now.getFullYear() - i}>{now.getFullYear() - i}</option>
                ))}
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#ff9900" tick={{ fill: '#ff9900', fontWeight: 'bold' }} />
              <YAxis stroke="#ff9900" tick={{ fill: '#ff9900' }} />
              <Tooltip contentStyle={{ background: '#222', color: '#ff9900' }} formatter={(value) => `$${value}`}/>
              <Line type="monotone" dataKey="total" stroke="#ff6600" strokeWidth={3} dot={false} />
              <Scatter data={salesTrendData} fill="#ff6600" line={false} shape="circle" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 