export default function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const isAuthEndpoint = url.includes('/login') || url.includes('/register');
  const headers = {
    ...(options.headers || {}),
    ...(token && !isAuthEndpoint ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
} 