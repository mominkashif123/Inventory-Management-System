import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authFetch from '../utils/authFetch';
import { saveAs } from 'file-saver';
import Fuse from 'fuse.js';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pdfMonth, setPdfMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const SALES_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);

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

  // Fuzzy search using fuse.js
  let fuzzySales = sales;
  if (searchTerm) {
    const fuse = new Fuse(sales, {
      keys: [
        'id',
        'customer_name',
        'customer_email',
        'customer_number',
        { name: 'items.name', getFn: sale => (sale.items || []).map(i => i.name).join(' ') }
      ],
      threshold: 0.4,
    });
    fuzzySales = fuse.search(searchTerm).map(result => result.item);
  }
  // Filter sales by date range
  const filteredSales = fuzzySales.filter(sale => {
    if (startDate && new Date(sale.created_at) < new Date(startDate)) return false;
    if (endDate && new Date(sale.created_at) > new Date(endDate + 'T23:59:59')) return false;
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSales.length / SALES_PER_PAGE);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * SALES_PER_PAGE,
    currentPage * SALES_PER_PAGE
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(paginatedSales.map(s => s.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    setSelected(selected.includes(id) ? selected.filter(sid => sid !== id) : [...selected, id]);
  };

  const handleBulkExport = () => {
    if (!selected.length) return;
    const selectedSales = paginatedSales.filter(sale => selected.includes(sale.id));
    const headers = ['Sale ID', 'Total', 'Date', 'Customer Name', 'Customer Email', 'Customer Number', 'Products'];
    const rows = selectedSales.map(sale => [
      sale.id,
      sale.total,
      new Date(sale.created_at).toLocaleString(),
      sale.customer_name || '',
      sale.customer_email || '',
      sale.customer_number || '',
      (sale.items || []).map(item => `${item.name} x${item.quantity}`).join('; ')
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected sales?`)) return;
    for (const id of selected) {
      await authFetch(`http://localhost:5000/api/sales/${id}`, { method: 'DELETE' });
    }
    setSales(sales.filter(s => !selected.includes(s.id)));
    setSelected([]);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="pt-24 max-w-5xl mx-auto px-4 min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <h2 className="text-3xl font-bold mb-8 text-orange-700">Sales History</h2>
      <div className="overflow-x-auto mb-8">
        <div className="flex items-center mb-2 gap-4">
          <input type="checkbox" checked={selected.length === paginatedSales.length && paginatedSales.length > 0} onChange={handleSelectAll} />
          <span className="text-sm">Select All</span>
          <button
            onClick={handleBulkExport}
            disabled={!selected.length}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
          >
            Export Selected
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={!selected.length}
            className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-2"
          >
            Delete Selected
          </button>
        </div>
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
          <thead className="bg-orange-50">
            <tr>
              <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold"><input type="checkbox" checked={selected.length === paginatedSales.length && paginatedSales.length > 0} onChange={handleSelectAll} /></th>
              <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold">Sale ID</th>
              <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold">Total</th>
              <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold">Date</th>
              <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold">Product(s)</th>
              <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold">Customer</th>
              <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSales.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">No sales found.</td>
              </tr>
            ) : (
              paginatedSales.map(sale => (
                <tr key={sale.id} className="hover:bg-orange-50/50">
                  <td className="py-2 px-4 border-b"><input type="checkbox" checked={selected.includes(sale.id)} onChange={() => handleSelect(sale.id)} /></td>
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
                    {sale.customer_name && <div><span className="font-medium">{sale.customer_name}</span></div>}
                    {sale.customer_email && <div className="text-xs text-gray-500">{sale.customer_email}</div>}
                    {sale.customer_number && <div className="text-xs text-gray-500">{sale.customer_number}</div>}
                    {!(sale.customer_name || sale.customer_email || sale.customer_number) && <span className="text-xs text-gray-400">-</span>}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <Link to={`/sales/${sale.id}`} className="inline-block bg-blue-500 text-white px-4 py-1 rounded font-semibold shadow hover:bg-blue-600 transition">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-orange-200 text-orange-800 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-orange-200 text-orange-800 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
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