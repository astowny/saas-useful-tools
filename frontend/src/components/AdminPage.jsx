import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

const ADMIN_EMAIL = 'astowny@gmail.com';

const AdminPage = () => {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.email === ADMIN_EMAIL;

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [usersRes, usageRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.REACT_APP_API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      if (usersRes.ok) { const d = await usersRes.json(); setUsers(d.users || []); }
      if (usageRes.ok) { const d = await usageRes.json(); setStats(d); }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Guard after all hooks
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">🛡️ {t('admin.title')}</h1>
      <p className="text-gray-500 mb-8">{t('admin.subtitle')}</p>

      {error && <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">{t('admin.fetchError')}: {error}</div>}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: t('admin.totalUsers'), value: stats.total_users ?? '—', icon: '👥' },
            { label: t('admin.proUsers'), value: stats.pro_users ?? '—', icon: '⭐' },
            { label: t('admin.enterpriseUsers'), value: stats.enterprise_users ?? '—', icon: '🏢' },
            { label: t('admin.totalUsage'), value: stats.total_usage ?? '—', icon: '📊' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t('admin.userList')} ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">{t('admin.plan')}</th>
                <th className="px-6 py-3 text-left">{t('admin.joined')}</th>
                <th className="px-6 py-3 text-left">{t('admin.usageToday')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">{t('admin.noUsers')}</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.plan_name === 'enterprise' ? 'bg-purple-100 text-purple-700'
                      : u.plan_name === 'pro' ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-500'
                    }`}>{u.plan_name || 'free'}</span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-3 text-gray-500">{u.usage_today ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

