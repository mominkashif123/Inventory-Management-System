import React, { useEffect, useState, useMemo } from 'react';
import authFetch from '../utils/authFetch';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  LineChart, 
  Line, 
  CartesianGrid,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
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
  const [trendView, setTrendView] = useState('monthly');
  const [last7DaysSales, setLast7DaysSales] = useState([]);
  const [showAllStock, setShowAllStock] = useState(false);
  const STOCK_DISPLAY_LIMIT = 8;
  const outOfStockItems = lowStock.filter(p => Number(p.quantity) === 0);
  const displayedStock = showAllStock ? outOfStockItems : outOfStockItems.slice(0, STOCK_DISPLAY_LIMIT);
  const RECENT_SALES_DISPLAY_LIMIT = 8;
  const [showAllRecentSales, setShowAllRecentSales] = useState(false);
  const displayedRecentSales = showAllRecentSales ? last7DaysSales : last7DaysSales.slice(0, RECENT_SALES_DISPLAY_LIMIT);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const monthName = useMemo(() =>
    new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' }),
    [selectedMonth, selectedYear]
  );

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

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

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
    window.location.reload();
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-orange-600 font-semibold text-lg">Loading dashboard...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-xl font-semibold">{error}</div>
      </div>
    </div>
  );

  // Aggregate bestsellers by product name for PieChart
  const productBreakdownMap = {};
  bestsellers.forEach(p => {
    if (productBreakdownMap[p.name]) {
      productBreakdownMap[p.name].value += Number(p.total_sold);
    } else {
      productBreakdownMap[p.name] = { name: p.name, value: Number(p.total_sold) };
    }
  });
  const productBreakdown = Object.values(productBreakdownMap).filter(p => p.value > 0);
  const lowStockFiltered = lowStock.filter(p => p.quantity < 1);
  const lowStockCritical = lowStockFiltered.filter(p => p.quantity <= 0);
  const lowStockWarning = lowStockFiltered.filter(p => p.quantity > 0);
  const pieColors = ['#ea580c', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#f97316', '#c2410c'];
  const displayedLowStockWarning = lowStockWarning;

  const salesTrendData = trendView === 'monthly'
    ? recentSales.map(day => ({
        date: day.day,
        total: Number(day.total_sales)
      }))
    : recentSales.map(month => ({
        date: month.month,
        total: Number(month.total_sales)
      }));

  // Calculate growth percentage (mock calculation for demo)
  const currentRevenue = Number(summary?.total_revenue || 0);
  const previousRevenue = currentRevenue * 0.85; // Mock previous period data
  const growthPercentage = ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Critical Stock Alert */}
        {lowStockCritical.length > 0 && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-bold text-red-800">Critical Stock Alert</h3>
                </div>
                <div className="flex flex-wrap gap-3 mb-3">
              {lowStockCritical.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleProductClick(p)}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {p.name}
                </button>
              ))}
            </div>
                <p className="text-sm text-red-700">Click a product to update inventory levels.</p>
              </div>
          </div>
        )}

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img 
                    src={THS} 
                    alt="THS" 
                    className="h-14 w-auto filter drop-shadow-lg" 
                  />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                    THS Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">Real-time business analytics</p>
                </div>
                </div>
              
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center transform hover:scale-105 transition-all duration-200">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Total Sales</div>
                  <div className="text-3xl font-bold text-orange-600">{summary?.total_sales || 0}</div>
                  <div className="text-xs text-green-600 mt-2">+12% from last month</div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center transform hover:scale-105 transition-all duration-200">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Revenue</div>
                  <div className="text-3xl font-bold text-orange-600">${Number(summary?.total_revenue || 0).toLocaleString()}</div>
                  <div className="text-xs text-green-600 mt-2">+{growthPercentage}% growth</div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center transform hover:scale-105 transition-all duration-200">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Inventory Value</div>
                  <div className="text-3xl font-bold text-orange-600">${Number(inventoryValue?.inventory_value || 0).toLocaleString()}</div>
                  <div className="text-xs text-blue-600 mt-2">Current total</div>
                </div>
                </div>
            </div>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
            
            {/* Best Sellers Chart */}
            <div className="lg:col-span-4 bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
              
              {productBreakdown.length > 0 ? (
                <>
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={productBreakdown} 
                          dataKey="value" 
                          nameKey="name" 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={80}
                          innerRadius={40}
                          paddingAngle={2}
                        >
                          {productBreakdown.map((entry, idx) => 
                            <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                          )}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {productBreakdown.slice(0, 5).map((p, idx) => (
                      <div key={p.name + idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700">{p.name}</span>
                        </div>
                        <span className="text-sm font-bold text-orange-600">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No sales data available
          </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="lg:col-span-4 bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Out of Stock</h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                {displayedStock.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-600 font-medium">All stock levels healthy!</p>
                  </div>
                ) : (
                  <>
                    {displayedStock.map((p, idx) => (
                      <div key={p.id + '-' + idx} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium text-red-800">{p.name}</span>
                        </div>
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">OUT OF STOCK</span>
                      </div>
                    ))}
                    {outOfStockItems.length > STOCK_DISPLAY_LIMIT && (
                      <button
                        className="text-orange-600 underline text-sm mt-2"
                        onClick={() => setShowAllStock(v => !v)}
                      >
                        {showAllStock ? "Show Less" : "Show More"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Recent Sales */}
            <div className="lg:col-span-4 bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Sales</h3>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">Last 7 days</span>
              </div>
              <div className="space-y-3 flex-1">
                {displayedRecentSales.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No recent sales data
                  </div>
                ) : (
                  <>
                    {displayedRecentSales.map(sale => (
                      <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(sale.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(sale.created_at).toLocaleTimeString()}
            </div>
          </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-orange-600">${sale.total}</div>
        </div>
          </div>
                    ))}
                    {last7DaysSales.length > RECENT_SALES_DISPLAY_LIMIT && (
                      <button
                        className="text-orange-600 underline text-sm mt-2"
                        onClick={() => setShowAllRecentSales(v => !v)}
                      >
                        {showAllRecentSales ? "Show Less" : "Show More"}
                      </button>
                    )}
                  </>
            )}
          </div>
          </div>
          </div>

          {/* Sales Trend Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Sales Trend - {trendView === 'monthly' ? `${monthName} ${selectedYear}` : `${selectedYear}`}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Track your revenue performance over time</p>
        </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="trendView"
                  value="monthly"
                  checked={trendView === 'monthly'}
                  onChange={() => setTrendView('monthly')}
                      className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                />
                    <span className="text-sm font-medium text-gray-700">Monthly</span>
              </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="trendView"
                  value="yearly"
                  checked={trendView === 'yearly'}
                  onChange={() => setTrendView('yearly')}
                      className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                />
                    <span className="text-sm font-medium text-gray-700">Yearly</span>
              </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  {trendView === 'monthly' && (
                    <select 
                      value={selectedMonth} 
                      onChange={e => setSelectedMonth(Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={i+1}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                ))}
              </select>
                  )}
                  
                  <select 
                    value={selectedYear} 
                    onChange={e => setSelectedYear(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                {[...Array(6)].map((_, i) => (
                      <option key={now.getFullYear() - i} value={now.getFullYear() - i}>
                        {now.getFullYear() - i}
                      </option>
                ))}
              </select>
                </div>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                    formatter={(value) => [`$${value}`, 'Sales']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#ea580c" 
                    strokeWidth={3}
                    fill="url(#salesGradient)"
                    dot={{ r: 4, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Analytics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Number(summary?.total_revenue || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
              <div className="text-xs text-green-600 mt-2">+{growthPercentage}% vs last month</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{lowStock.length}</div>
              <div className="text-sm text-gray-600">Products in Stock</div>
              <div className="text-xs text-blue-600 mt-2">{lowStockCritical.length} need attention</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{last7DaysSales.length}</div>
              <div className="text-sm text-gray-600">Sales This Week</div>
              <div className="text-xs text-green-600 mt-2">+15% vs last week</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {bestsellers.length > 0 ? bestsellers[0]?.name.substring(0, 8) + '...' : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Top Product</div>
              <div className="text-xs text-purple-600 mt-2">{bestsellers[0]?.total_sold || 0} sold</div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Product Modal */}
      {showUpdateModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Update Product</h2>
                <button 
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    value={selectedProduct.name} 
                    onChange={e => setSelectedProduct({ ...selectedProduct, name: e.target.value })} 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                      value={selectedProduct.quantity} 
                      onChange={e => setSelectedProduct({ ...selectedProduct, quantity: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                      value={selectedProduct.value} 
                      onChange={e => setSelectedProduct({ ...selectedProduct, value: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    rows="3"
                    value={selectedProduct.description} 
                    onChange={e => setSelectedProduct({ ...selectedProduct, description: e.target.value })} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                      value={selectedProduct.part_number} 
                      onChange={e => setSelectedProduct({ ...selectedProduct, part_number: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                      value={selectedProduct.type} 
                      onChange={e => setSelectedProduct({ ...selectedProduct, type: e.target.value })} 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    value={selectedProduct.location} 
                    onChange={e => setSelectedProduct({ ...selectedProduct, location: e.target.value })} 
                  />
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg"
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 