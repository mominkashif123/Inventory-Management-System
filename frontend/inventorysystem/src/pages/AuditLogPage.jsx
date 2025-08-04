import React, { useEffect, useState } from 'react';
import authFetch from '../utils/authFetch';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // authFetch('http://localhost:5000/api/audit-logs')
    authFetch('https://inventory-management-system-uyit.onrender.com/api/audit-logs')
      .then(res => res.json())
      .then(res => {
        setLogs(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load audit logs');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  // CSV export function
  const downloadCSV = () => {
    if (!logs.length) return;
    const headers = ['User ID', 'Action', 'Details', 'Date'];
    const rows = logs.map(log => [
      log.user_id || 'System',
      log.action,
      log.details,
      new Date(log.created_at).toLocaleString()
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-24 max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Audit Log</h2>
        <button
          onClick={downloadCSV}
          disabled={!logs.length}
          className={`px-6 py-2 rounded-xl font-semibold shadow transition text-white ${logs.length ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Download CSV
        </button>
      </div>
      <table className="min-w-full bg-white border border-gray-200 rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b">User ID</th>
            <th className="py-2 px-4 border-b">Action</th>
            <th className="py-2 px-4 border-b">Details</th>
            <th className="py-2 px-4 border-b">Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-500">No logs found.</td>
            </tr>
          ) : (
            logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{log.user_id || 'System'}</td>
                <td className="py-2 px-4 border-b">{log.action}</td>
                <td className="py-2 px-4 border-b">{log.details}</td>
                <td className="py-2 px-4 border-b">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 