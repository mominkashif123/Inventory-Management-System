import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
      <div className="font-bold text-lg">
        <Link to="/">Inventory System</Link>
      </div>
      <ul className="flex space-x-6">
        <li><Link className="hover:text-blue-300" to="/">Home</Link></li>
        <li><Link className="hover:text-blue-300" to="/products">Products</Link></li>
        <li><Link className="hover:text-blue-300" to="/login">Login</Link></li>
        <li><Link className="hover:text-blue-300" to="/register">Register</Link></li>
      </ul>
    </nav>
  );
} 