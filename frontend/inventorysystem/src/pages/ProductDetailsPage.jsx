import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProduct(data.data);
        } else {
          setError('Product not found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load product');
        setLoading(false);
      });
  }, [id]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'accessories': return 'bg-orange-400';
      case 'merchandise': return 'bg-orange-500';
      case 'workshop': return 'bg-orange-600';
      default: return 'bg-gray-400';
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!product) return null;

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
            <h1 className="text-3xl font-bold text-gray-900">Product Details</h1>
            <p className="text-gray-600">View inventory item information</p>
          </div>
        </div>
        <div className="bg-white border border-orange-200 p-8 shadow-xl rounded-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl`}>
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${getTypeColor(product.type)}`}>{product.type}</span>
            </div>
          </div>
          <div className="mb-2"><span className="font-medium">Name:</span> {product.name}</div>
          <div className="mb-2"><span className="font-medium">Description:</span> {product.description}</div>
          <div className="mb-2"><span className="font-medium">Quantity:</span> {product.quantity}</div>
          <div className="mb-2"><span className="font-medium">Value:</span> {product.value}</div>
          <div className="mb-2"><span className="font-medium">Part Number:</span> {product.part_number}</div>
          <div className="mt-4">
            <Link to={`/products/${product.id}/edit`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2">Edit</Link>
            <Link to="/products" className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">Back to Products</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
