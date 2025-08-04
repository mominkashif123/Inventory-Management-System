import React, { useEffect, useState } from 'react';
import authFetch from '../utils/authFetch';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'cashier' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    authFetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(res => {
        setUsers(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users');
        setLoading(false);
      });
  }, []);

  const handleRoleChange = async (id, newRole) => {
    setSaving(true);
    try {
      const res = await authFetch(`http://localhost:5000/api/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      } else {
        setError(data.error || 'Failed to update role');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setSaving(true);
    try {
      const res = await authFetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setSaving(false);
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async e => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await authFetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setUsers([{ ...data.data, role: form.role }, ...users]);
        setForm({ username: '', password: '', role: 'cashier' });
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setCreating(false);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="pt-24 max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">User Management</h2>
      <form onSubmit={handleCreate} className="mb-8 flex flex-col md:flex-row gap-4 items-end bg-white dark:bg-gray-800 border border-orange-200 dark:border-gray-600 rounded-xl p-4 shadow">
        <div className="flex-1">
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleFormChange}
            className="w-full border border-orange-200 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleFormChange}
            className="w-full border border-orange-200 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleFormChange}
            className="border border-orange-200 dark:border-gray-600 rounded px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-orange-600 transition disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Add User'}
        </button>
      </form>
      <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">Username</th>
            <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">Role</th>
            <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-8 text-gray-500 dark:text-gray-400">No users found.</td>
            </tr>
          ) : (
            users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">{user.username}</td>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-600">
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    disabled={saving}
                    className="border border-orange-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 dark:text-red-400 hover:underline"
                    disabled={saving}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 