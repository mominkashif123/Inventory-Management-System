import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, LogIn, UserPlus, Menu, X, LogOut, BarChart2, ShoppingCart, ClipboardList, Moon, Sun, Settings, Users, FileText } from 'lucide-react';

const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem('theme');
    if (stored) return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'light';
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme());
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token && !!user;
  const role = user?.role;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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
      ...(role === 'admin' ? [
        { path: '/users', label: 'Users', icon: Users },
        { path: '/audit-logs', label: 'Audit Logs', icon: FileText },
      ] : []),
    ] : []),
    ...(!isLoggedIn ? [
      { path: '/login', label: 'Login', icon: LogIn },
    ] : []),
  ];

  return (
    <nav className={`sticky top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-gray-700' 
        : 'bg-gradient-to-r from-orange-50 to-white/95 dark:from-gray-900 dark:to-gray-800 backdrop-blur-xl border-b border-orange-100 dark:border-gray-700'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3 flex-shrink-0">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent dark:from-orange-100 dark:to-orange-400">
              THS Management
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive(path)
                    ? 'bg-orange-50 text-orange-600 shadow-sm border border-orange-100 dark:bg-gray-800 dark:text-orange-400 dark:border-gray-600'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-300 dark:hover:text-orange-400 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
            
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all duration-300"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 dark:text-gray-300 dark:hover:text-orange-400 dark:hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Dark/Light Mode Toggle for Mobile */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all duration-300"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'max-h-96 opacity-100 visible' 
            : 'max-h-0 opacity-0 invisible'
        }`}>
          <div className="py-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-b-xl shadow-lg">
            <div className="flex flex-col gap-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive(path)
                      ? 'bg-orange-50 text-orange-600 dark:bg-gray-700 dark:text-orange-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:text-orange-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:text-orange-400 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
