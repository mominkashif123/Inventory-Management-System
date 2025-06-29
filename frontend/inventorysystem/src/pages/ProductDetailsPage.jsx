import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

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

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!product) return null;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Product Details</h2>
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
  );
} 