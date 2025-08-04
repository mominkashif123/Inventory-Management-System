import React, { useEffect, useState } from 'react';
import authFetch from '../utils/authFetch';

export default function InventoryAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: '', change: '', reason: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // authFetch('http://localhost:5000/api/inventory-adjustments')
    authFetch('https://inventory-management-system-uyit.onrender.com/api/inventory-adjustments')
      .then(res => res.json())
      .then(res => {
        setAdjustments(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load adjustments');
        setLoading(false);
      });
    // authFetch('http://localhost:5000/api/products')
    authFetch('https://inventory-management-system-uyit.onrender.com/api/products')
      .then(res => res.json())
      .then(res => setProducts(res.data || []));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // For now, user_id is null (add real user logic as needed)
      // const res = await authFetch('http://localhost:5000/api/inventory-adjustments', {
      const res = await authFetch('https://inventory-management-system-uyit.onrender.com/api/inventory-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, user_id: null, change: parseInt(form.change) })
      });
      const data = await res.json();
      if (data.success) {
        setAdjustments([data.data, ...adjustments]);
        setForm({ product_id: '', change: '', reason: '' });
      } else {
        setError(data.error || 'Failed to create adjustment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="pt-24 max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Inventory Adjustments</h2>
      <form onSubmit={handleSubmit} className="mb-8 bg-white border border-orange-200 rounded-xl p-6 shadow space-y-4">
        <div>
          <label className="block font-medium mb-1">Product</label>
          <select
            name="product_id"
            value={form.product_id}
            onChange={handleChange}
            className="w-full border border-orange-200 rounded px-3 py-2"
            required
          >
            <option value="">Select product</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Change (positive or negative)</label>
          <input
            name="change"
            type="number"
            value={form.change}
            onChange={handleChange}
            className="w-full border border-orange-200 rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Reason</label>
          <input
            name="reason"
            value={form.reason}
            onChange={handleChange}
            className="w-full border border-orange-200 rounded px-3 py-2"
            placeholder="e.g. Restock, Damaged, Lost"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-orange-600 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Add Adjustment'}
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Product</th>
              <th className="py-2 px-4 border-b">Change</th>
              <th className="py-2 px-4 border-b">Reason</th>
              <th className="py-2 px-4 border-b">Date</th>
            </tr>
          </thead>
          <tbody>
            {adjustments.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">No adjustments found.</td>
              </tr>
            ) : (
              adjustments.map(adj => (
                <tr key={adj.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{products.find(p => p.id === adj.product_id)?.name || adj.product_id}</td>
                  <td className="py-2 px-4 border-b">{adj.change}</td>
                  <td className="py-2 px-4 border-b">{adj.reason}</td>
                  <td className="py-2 px-4 border-b">{new Date(adj.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 