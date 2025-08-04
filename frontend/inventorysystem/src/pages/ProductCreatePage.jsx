import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Package } from 'lucide-react';
import authFetch from '../utils/authFetch';

const ProductCreatePage = () => {
  const [form, setForm] = useState({ name: '', description: '', quantity: '', value: '', part_number: '', type: 'accessories', location: 'warehouse' });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = e => {
    setForm({ ...form, type: e.target.value });
  };

  const handleLocationChange = e => {
    setForm({ ...form, location: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    if (!form.name) {
      setError('Product name is required');
      setSaving(false);
      return;
    }
    try {
      // const res = await authFetch('http://localhost:5000/api/products', {
      const res = await authFetch('https://inventory-management-system-uyit.onrender.com/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        navigate('/products');
      } else {
        setError(data.error || 'Failed to create product');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'accessories': return 'from-orange-400 to-orange-500';
      case 'merchandise': return 'from-orange-500 to-orange-600';
      case 'workshop': return 'from-orange-600 to-orange-700';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/products"
            className="p-3 bg-white border border-orange-200 rounded-xl text-orange-600 hover:bg-orange-50 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
            <p className="text-gray-600">Create a new inventory item</p>
          </div>
        </div>
        <div className="bg-white border border-orange-200 p-8 shadow-xl rounded-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-4 bg-gradient-to-r ${getTypeColor(form.type)} rounded-xl`}>
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Product Information</h2>
              <p className="text-gray-600">Enter the details below</p>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-fade-in">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-700 font-medium text-sm">Product Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="bg-white border border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded px-3 py-2 w-full"
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 font-medium text-sm">Product Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleTypeChange}
                  className="bg-white border border-orange-200 rounded px-3 py-2 w-full"
                >
                  <option value="accessories">Accessories</option>
                  <option value="merchandise">Merchandise</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 font-medium text-sm">Location</label>
                <select
                  name="location"
                  value={form.location}
                  onChange={handleLocationChange}
                  className="bg-white border border-orange-200 rounded px-3 py-2 w-full"
                >
                  <option value="warehouse">Warehouse</option>
                  <option value="store">Store</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-gray-700 font-medium text-sm">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="bg-white border border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 min-h-[100px] rounded px-3 py-2 w-full"
                placeholder="Enter product description"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-gray-700 font-medium text-sm">Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  step="0.001"
                  value={form.quantity}
                  onChange={handleChange}
                  className="bg-white border border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded px-3 py-2 w-full"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 font-medium text-sm">Value ($)</label>
                <input
                  name="value"
                  type="number"
                  step="0.01"
                  value={form.value}
                  onChange={handleChange}
                  className="bg-white border border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded px-3 py-2 w-full"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 font-medium text-sm">Part Number</label>
                <input
                  name="part_number"
                  value={form.part_number}
                  onChange={handleChange}
                  className="bg-white border border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 rounded px-3 py-2 w-full"
                  placeholder="SKU/Part #"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Add Product
                  </>
                )}
              </button>
              <Link
                to="/products"
                className="px-6 py-3 bg-white border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 transition-colors flex items-center gap-2"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductCreatePage;
