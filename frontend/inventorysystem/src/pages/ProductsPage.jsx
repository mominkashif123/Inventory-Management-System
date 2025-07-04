import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 50;

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(res => {
        setProducts(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load products');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.part_number && product.part_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(product => product.type === filterType);
    }
    if (filterLocation !== 'all') {
      filtered = filtered.filter(product => product.location === filterLocation);
    }
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page on filter/search change
  }, [products, searchTerm, filterType, filterLocation]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
    setProducts(products.filter(p => p.id !== id));
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link
          to="/products/new"
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-orange-600 transition text-center md:ml-auto"
        >
          + Add Product
        </Link>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, description, or part number..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-orange-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2 border border-orange-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="all">All Types</option>
          <option value="accessories">Accessories</option>
          <option value="merchandise">Merchandise</option>
          <option value="workshop">Workshop</option>
        </select>
        <select
          value={filterLocation}
          onChange={e => setFilterLocation(e.target.value)}
          className="px-4 py-2 border border-orange-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="all">All Locations</option>
          <option value="warehouse">Warehouse</option>
          <option value="store">Store</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Type</th>
              <th className="py-2 px-4 border-b">Location</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Quantity</th>
              <th className="py-2 px-4 border-b">Value</th>
              <th className="py-2 px-4 border-b">Part Number</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">No products found.</td>
              </tr>
            ) : (
              paginatedProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b"><Link className="text-blue-600 hover:underline" to={`/products/${product.id}`}>{product.name}</Link></td>
                  <td className="py-2 px-4 border-b">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${
                      product.type === 'accessories' ? 'bg-orange-400' :
                      product.type === 'merchandise' ? 'bg-orange-500' :
                      product.type === 'workshop' ? 'bg-orange-600' : 'bg-gray-400'
                    }`}>
                      {product.type}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">{product.location}</td>
                  <td className="py-2 px-4 border-b">{product.description}</td>
                  <td className="py-2 px-4 border-b">{product.quantity}</td>
                  <td className="py-2 px-4 border-b">{product.value}</td>
                  <td className="py-2 px-4 border-b">{product.part_number}</td>
                  <td className="py-2 px-4 border-b">
                    <Link to={`/products/${product.id}/edit`} className="text-yellow-600 hover:underline mr-2">Edit</Link>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline">Delete</button>
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
    </div>
  );
}
