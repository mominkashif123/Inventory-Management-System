// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://inventory-management-system-uyit.onrender.com';

export const API_ENDPOINTS = {
  // Users
  LOGIN: `${API_BASE_URL}/api/users/login`,
  REGISTER: `${API_BASE_URL}/api/users/register`,
  USERS: `${API_BASE_URL}/api/users`,
  USER_ROLE: (id) => `${API_BASE_URL}/api/users/${id}/role`,
  USER_DELETE: (id) => `${API_BASE_URL}/api/users/${id}`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT: (id) => `${API_BASE_URL}/api/products/${id}`,
  
  // Sales
  SALES: `${API_BASE_URL}/api/sales`,
  SALE: (id) => `${API_BASE_URL}/api/sales/${id}`,
  
  // Reports
  SALES_SUMMARY: `${API_BASE_URL}/api/reports/sales-summary`,
  INVENTORY_VALUE: `${API_BASE_URL}/api/reports/inventory-value`,
  BESTSELLERS: `${API_BASE_URL}/api/reports/bestsellers`,
  LOW_STOCK: `${API_BASE_URL}/api/reports/low-stock`,
  RECENT_SALES: `${API_BASE_URL}/api/reports/recent-sales`,
  MONTHLY_ORDERS_PDF: (month) => `${API_BASE_URL}/api/reports/monthly-orders/pdf?month=${month}`,
  
  // Inventory Adjustments
  INVENTORY_ADJUSTMENTS: `${API_BASE_URL}/api/inventory-adjustments`,
  
  // Audit Logs
  AUDIT_LOGS: `${API_BASE_URL}/api/audit-logs`,
  
  // Test endpoint
  TEST: `${API_BASE_URL}/api/test`,
};

export default API_BASE_URL; 