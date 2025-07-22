import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, LogIn, UserPlus, Menu, X, LogOut, BarChart2, ShoppingCart, ClipboardList, Settings } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token && !!user;
  const role = user?.role;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    ...(isLoggedIn ? [
      { path: '/dashboard', label: 'Dashboard', icon: BarChart2 },
      { path: '/products', label: 'Products', icon: Package },
      { path: '/sales', label: 'Sales', icon: ClipboardList },
      { path: '/checkout', label: 'Checkout', icon: ShoppingCart },
      // { path: '/inventory-adjustments', label: 'Inventory', icon: Settings },
      ...(role === 'admin' ? [
        { path: '/users', label: 'Users', icon: UserPlus },
        { path: '/audit-logs', label: 'Audit Logs', icon: ClipboardList },
      ] : []),
    ] : []),
    ...(!isLoggedIn ? [
      { path: '/login', label: 'Login', icon: LogIn },
      // { path: '/register', label: 'Register', icon: UserPlus },
    ] : []),
  ];

  return (
    <nav className="sticky top-0 w-full z-50 bg-gradient-to-r from-orange-50 to-white/95 backdrop-blur-xl border-b border-orange-100 shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-4 gap-2">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl group-hover:rotate-12 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent">
              THS Management System
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive(path)
                    ? 'bg-orange-50 text-orange-600 shadow-sm border border-orange-100'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-orange-50 rounded-xl transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-orange-100 animate-fade-in bg-white/95 rounded-b-xl shadow-md">
            <div className="flex flex-col gap-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive(path)
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              {isLoggedIn && (
                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
