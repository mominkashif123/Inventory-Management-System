import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import authFetch from '../utils/authFetch';
import { saveAs } from 'file-saver';

export default function SaleDetailsPage() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- PDF Download State ---
  const [pdfMonth, setPdfMonth] = useState(() => sale ? sale.created_at.slice(0, 7) : new Date().toISOString().slice(0, 7));
  // --- PDF Download Handler ---
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

  useEffect(() => {
    authFetch(`http://localhost:5000/api/sales/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSale(data.data);
        } else {
          setError('Sale not found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load sale');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!sale) return null;

  return (
    <div className="pt-24 max-w-2xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <label className="font-medium mr-2">Download Monthly Sales PDF:</label>
          <input
            type="month"
            value={pdfMonth}
            onChange={e => setPdfMonth(e.target.value)}
            className="border border-orange-200 rounded px-2 py-1 mr-2"
          />
          <button
            onClick={handleDownloadPdf}
            className="bg-orange-500 text-white px-4 py-2 rounded font-semibold hover:bg-orange-600 transition"
          >
            Download PDF
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-orange-100">
        <h2 className="text-3xl font-bold mb-4 text-orange-700 flex items-center gap-2">
          <span>Sale Details</span>
          <span className="text-base font-medium text-gray-400">#{sale.id}</span>
        </h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div>
            <div className="text-gray-700"><span className="font-medium">Date:</span> {new Date(sale.created_at).toLocaleString()}</div>
            {sale.customer_name && (
              <div className="text-gray-700">
                <span className="font-medium">Customer:</span> {sale.customer_name}
                {sale.customer_email && <> | <span className="font-medium">Email:</span> {sale.customer_email}</>}
                {sale.customer_number && <> | <span className="font-medium">Number:</span> {sale.customer_number}</>}
              </div>
            )}
          </div>
          <div>
            <div className="text-gray-700"><span className="font-medium">Total:</span> <span className="text-lg font-bold text-orange-600">${sale.total}</span></div>
          </div>
        </div>
        <h3 className="font-semibold mb-3 text-gray-800">Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded shadow-sm">
            <thead className="bg-orange-50">
              <tr>
                <th className="py-2 px-4 border-b text-left">Product</th>
                <th className="py-2 px-4 border-b text-left">Part #</th>
                <th className="py-2 px-4 border-b text-center">Quantity</th>
                <th className="py-2 px-4 border-b text-right">Price</th>
                <th className="py-2 px-4 border-b text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.items && sale.items.length > 0 ? (
                sale.items.map(item => (
                  <tr key={item.id} className="hover:bg-orange-50/50">
                    <td className="py-2 px-4 border-b font-medium text-gray-900">{item.name || item.product_id}</td>
                    <td className="py-2 px-4 border-b text-gray-700">{item.part_number || '-'}</td>
                    <td className="py-2 px-4 border-b text-center">{item.quantity}</td>
                    <td className="py-2 px-4 border-b text-right">${item.price}</td>
                    <td className="py-2 px-4 border-b text-right">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">No items found.</td>
                </tr>
              )}
            </tbody>
            {sale.items && sale.items.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4} className="py-2 px-4 text-right font-semibold text-gray-800">Total</td>
                  <td className="py-2 px-4 text-right font-bold text-orange-700">${sale.total}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <Link to="/sales" className="inline-block mt-6 bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-orange-600 transition">Back to Sales</Link>
      </div>
    </div>
  );
} 