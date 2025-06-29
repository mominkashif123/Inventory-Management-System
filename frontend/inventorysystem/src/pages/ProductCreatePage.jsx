import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductCreatePage() {
  const [form, setForm] = useState({ name: '', description: '', quantity: '', value: '', part_number: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    if (!form.name) {
      setError('Product name is required');
      return;
    }
    const res = await fetch('http://localhost:5000/api/products', {
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
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add Product</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <input name="description" value={form.description} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Quantity</label>
          <input name="quantity" value={form.quantity} onChange={handleChange} type="number" step="0.001" className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Value</label>
          <input name="value" value={form.value} onChange={handleChange} type="number" step="0.01" className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Part Number</label>
          <input name="part_number" value={form.part_number} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Product</button>
      </form>
    </div>
  );
} 