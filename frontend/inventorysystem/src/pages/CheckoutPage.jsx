import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authFetch from '../utils/authFetch';

export default function CheckoutPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [usdToPkr, setUsdToPkr] = useState(284.38); // fallback to recent rate
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [itemDiscounts, setItemDiscounts] = useState({}); // { product_id: { type: 'percent'|'fixed', value: '' } }
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // authFetch('http://localhost:5000/api/products')
    authFetch('https://inventory-management-system-uyit.onrender.com/api/products')
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

  // Fetch USD to PKR rate on mount
  useEffect(() => {
    fetch('https://api.exchangerate.host/latest?base=USD&symbols=PKR')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.PKR) setUsdToPkr(data.rates.PKR);
      })
      .catch(() => {});
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.value, quantity: 1 }];
    });
  };

  const updateQuantity = (product_id, quantity) => {
    setCart(prev => prev.map(item => item.product_id === product_id ? { ...item, quantity: Math.max(1, quantity) } : item));
  };

  const removeFromCart = (product_id) => {
    setCart(prev => prev.filter(item => item.product_id !== product_id));
  };

  // Calculate per-item discounted price
  const getItemDiscountedPrice = (item) => {
    const d = itemDiscounts[item.product_id] || { type: 'percent', value: '' };
    let discount = 0;
    if (d.type === 'percent' && d.value) {
      discount = (item.price * item.quantity * Number(d.value)) / 100;
    } else if (d.type === 'fixed' && d.value) {
      discount = Number(d.value);
    }
    if (discount > item.price * item.quantity) discount = item.price * item.quantity;
    return (item.price * item.quantity) - discount;
  };

  // Calculate totals and discounts
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  if (discountType === 'percent' && discountValue) {
    discount = (cartTotal * Number(discountValue)) / 100;
  } else if (discountType === 'fixed' && discountValue) {
    discount = Number(discountValue);
  }
  if (discount > cartTotal) discount = cartTotal;
  // Add per-item discounts
  const perItemDiscountedTotal = cart.reduce((sum, item) => sum + getItemDiscountedPrice(item), 0);
  const discountedTotal = perItemDiscountedTotal - discount;
  const totalPKR = discountedTotal * usdToPkr;

  const handleCheckout = async () => {
    setSaving(true);
    try {
      // For now, user_id is null (add real user logic as needed)
      // const res = await authFetch('http://localhost:5000/api/sales', {
      const res = await authFetch('https://inventory-management-system-uyit.onrender.com/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: null,
          items: cart,
          payment_method: paymentMethod,
          customer_name: customerName || null,
          customer_email: customerEmail || null,
          customer_number: customerNumber || null
        })
      });
      const data = await res.json();
      if (data.success) {
        navigate('/sales');
      } else {
        setError(data.error || 'Failed to process sale');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  // Filter products by name, part number, description, type, location, and price
  const filteredProducts = products.filter(product => {
    if (filterType !== 'all' && product.type !== filterType) return false;
    if (filterLocation !== 'all' && product.location !== filterLocation) return false;
    if (minPrice !== '' && Number(product.value) < Number(minPrice)) return false;
    if (maxPrice !== '' && Number(product.value) > Number(maxPrice)) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      (product.part_number && product.part_number.toLowerCase().includes(term)) ||
      (product.description && product.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="pt-24 max-w-4xl mx-auto px-2 sm:px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Checkout / New Sale</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Products</h3>
          <div className="flex gap-2 mb-4 flex-wrap">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-orange-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="w-32 px-4 py-2 border border-orange-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="w-32 px-4 py-2 border border-orange-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-4 py-2 border border-orange-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="accessories">Accessories</option>
              <option value="merchandise">Merchandise</option>
              <option value="workshop">Workshop</option>
            </select>
            <select
              value={filterLocation}
              onChange={e => setFilterLocation(e.target.value)}
              className="px-4 py-2 border border-orange-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Locations</option>
              <option value="warehouse">Warehouse</option>
              <option value="store">Store</option>
            </select>
          </div>
          <ul className="divide-y divide-orange-100 dark:divide-gray-700">
            {filteredProducts.map(product => (
              <li key={product.id} className="flex flex-col md:flex-row md:items-center md:justify-between py-2 gap-2">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{product.name} (${product.value}) <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Qty: {parseInt(product.quantity, 10)}</span></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{product.description}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">Part #: {product.part_number} | Type: {product.type} | Location: {product.location}</div>
                </div>
                {parseInt(product.quantity, 10) <= 0 ? (
                  <span className="text-red-500 dark:text-red-400 font-semibold text-sm">Out of Stock</span>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                  >
                    Add
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Cart</h3>
          {/* Customer Info Fields */}
          <div className="mb-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 flex flex-col gap-3">
            <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Customer Information</h4>
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="border border-orange-200 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="email"
              placeholder="Customer Email"
              value={customerEmail}
              onChange={e => setCustomerEmail(e.target.value)}
              className="border border-orange-200 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="tel"
              placeholder="Customer Number"
              value={customerNumber}
              onChange={e => setCustomerNumber(e.target.value)}
              className="border border-orange-200 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          {cart.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">No items in cart.</div>
          ) : (
            <ul className="flex flex-col gap-4 mb-4">
              {cart.map(item => (
                <li key={item.product_id} className="bg-white dark:bg-gray-800 rounded-xl shadow border border-orange-100 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{item.name} <span className="text-gray-500 dark:text-gray-400">(${item.price})</span></div>
                    <div className="flex flex-wrap gap-2 mt-2 items-center">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateQuantity(item.product_id, parseInt(e.target.value))}
                        className="w-16 border border-orange-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <label className="text-xs font-medium ml-4 text-gray-700 dark:text-gray-300">Item Discount:</label>
                      <select
                        value={(itemDiscounts[item.product_id]?.type) || 'percent'}
                        onChange={e => setItemDiscounts(d => ({ ...d, [item.product_id]: { ...d[item.product_id], type: e.target.value } }))}
                        className="border border-orange-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="percent">%</option>
                        <option value="fixed">$</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={(itemDiscounts[item.product_id]?.value) || ''}
                        onChange={e => setItemDiscounts(d => ({ ...d, [item.product_id]: { ...d[item.product_id], value: e.target.value, type: (d[item.product_id]?.type) || 'percent' } }))}
                        className="w-20 border border-orange-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder={itemDiscounts[item.product_id]?.type === 'fixed' ? 'USD' : '%'}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{itemDiscounts[item.product_id]?.type === 'fixed' ? 'USD off' : '% off'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm text-gray-700 dark:text-gray-300">Subtotal: <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span></div>
                    <div className="text-sm text-green-700 dark:text-green-400 font-bold">After Discount: ${getItemDiscountedPrice(item).toFixed(2)}</div>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-500 dark:text-red-400 hover:underline text-xs mt-2"
                    >Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="font-bold mb-2 text-gray-900 dark:text-white">Total: ${cartTotal.toFixed(2)}</div>
          <div className="mb-2 flex gap-2 items-center">
            <label className="font-medium text-gray-700 dark:text-gray-300">Discount:</label>
            <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="border border-orange-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="percent">%</option>
              <option value="fixed">$</option>
            </select>
            <input
              type="number"
              min="0"
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
              className="w-24 border border-orange-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={discountType === 'percent' ? 'Percent' : 'Amount'}
            />
            <span className="text-gray-500 dark:text-gray-400 text-sm">{discountType === 'percent' ? '% off' : 'USD off'}</span>
          </div>
          <div className="mb-2 font-semibold text-orange-700 dark:text-orange-400">Total after discount: ${discountedTotal.toFixed(2)}</div>
          <div className="mb-2 font-semibold text-green-700 dark:text-green-400">Total in PKR: {totalPKR.toLocaleString(undefined, { maximumFractionDigits: 0 })} PKR</div>
          <div className="mb-4 text-xs text-gray-500 dark:text-gray-400">Exchange Rate: 1 USD = {usdToPkr} PKR</div>
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full border border-orange-200 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || saving}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-orange-600 transition disabled:opacity-50"
          >
            {saving ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>
    </div>
  );
} 