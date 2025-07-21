import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authFetch from '../utils/authFetch';
import { saveAs } from 'file-saver';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pdfMonth, setPdfMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    authFetch('http://localhost:5000/api/sales')
      .then(res => res.json())
      .then(res => {
        setSales(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load sales');
        setLoading(false);
      });
  }, []);

  const handleDownloadPdf = async () => {
    const month = pdfMonth;
    const res = await fetch(`http://localhost:5000/api/reports/monthly-orders/pdf?month=${month}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) {
      alert('Failed to download PDF');
      return;
    }
    const blob = await res.blob();
    saveAs(blob, `sales-report-${month}.pdf`);
  };

  // Filter sales by search term and date range
  const filteredSales = sales.filter(sale => {
    if (startDate && new Date(sale.created_at) < new Date(startDate)) return false;
    if (endDate && new Date(sale.created_at) > new Date(endDate + 'T23:59:59')) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    // Sale ID
    if (sale.id && sale.id.toString().includes(term)) return true;
    // Date
    if (sale.created_at && new Date(sale.created_at).toLocaleString().toLowerCase().includes(term)) return true;
    // Product names in items
    if (sale.items && sale.items.some(item => (item.name || '').toLowerCase().includes(term))) return true;
    return false;
  });

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="pt-24 max-w-5xl mx-auto px-4">
      <h2 className="text-3xl font-bold mb-8 text-orange-700">Sales History</h2>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-lg">
          <thead className="bg-orange-50">
            <tr>
              <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold">Sale ID</th>
              <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold">Total</th>
              <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold">Date</th>
              <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold">Product(s)</th>
              <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">No sales found.</td>
              </tr>
            ) : (
              filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-orange-50/50">
                  <td className="py-2 px-4 border-b">{sale.id}</td>
                  <td className="py-2 px-4 border-b">${sale.total}</td>
                  <td className="py-2 px-4 border-b">{new Date(sale.created_at).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{sale.items && sale.items.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {sale.items.map(item => (
                        <span key={item.id || item.product_id} className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full border border-orange-200">
                          {item.name}
                          {item.part_number ? ` (${item.part_number})` : ''}
                          {` x${item.quantity || 1}`}
                        </span>
                      ))}
                    </div>
                  ) : 'N/A'}</td>
                  <td className="py-2 px-4 border-b">
                    <Link to={`/sales/${sale.id}`} className="inline-block bg-blue-500 text-white px-4 py-1 rounded font-semibold shadow hover:bg-blue-600 transition">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* PDF Download Controls - now below the table */}
      <div className="flex justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 mt-2 flex flex-col sm:flex-row sm:items-center gap-4 border border-orange-100">
          <label className="font-medium text-gray-700 mr-2">Download Monthly Sales PDF:</label>
          <input
            type="month"
            value={pdfMonth}
            onChange={e => setPdfMonth(e.target.value)}
            className="border border-orange-200 rounded px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={handleDownloadPdf}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Download PDF
          </button>
        </div>
      </div>
      {/* Filters and New Sale button remain at the top */}
      <div className="flex flex-col md:flex-row gap-2 items-center mt-8">
        <input
          type="text"
          placeholder="Search by sale ID or product name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-orange-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="px-4 py-2 border border-orange-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="px-4 py-2 border border-orange-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <Link
          to="/checkout"
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-orange-600 transition text-center"
        >
          + New Sale
        </Link>
      </div>
    </div>
  );
} 