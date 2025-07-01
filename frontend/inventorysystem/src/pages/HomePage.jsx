import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col items-center justify-center">
      <div className="bg-white border border-orange-200 p-10 rounded-xl shadow-xl flex flex-col items-center">
        <div className="mb-6">
          <Package className="w-16 h-16 text-orange-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Inventory Management System</h1>
        <p className="text-gray-600 mb-6">Track and manage your products, parts, and accessories with ease.</p>
        <Link to="/products" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors">View Products</Link>
      </div>
    </div>
  );
}
