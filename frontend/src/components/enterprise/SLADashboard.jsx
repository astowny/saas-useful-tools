import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const statusStyle = {
  up: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', icon: '🟢' },
  down: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700', icon: '🔴' },
  degraded: { dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
  unknown: { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600', icon: '⚪' },
};

const SLADashboard = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const API = process.env.REACT_APP_API_URL;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  const fetchSLA = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/enterprise/sla?days=${days}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message); }
      setData(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token, days]); // eslint-disable-line

  useEffect(() => { fetchSLA(); }, [fetchSLA]);

  const statusKey = data?.current_status || 'unknown';
  const style = statusStyle[statusKey] || statusStyle.unknown;
  const uptimeColor = (data?.uptime_percent ?? 100) >= 99.9 ? 'text-green-600' : 'text-red-600';

  if (loading) return <div className="p-8 text-gray-500">{t('common.loading')}</div>;
  if (error) return <div className="p-8 text-red-600">❌ {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('enterprise.sla.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('enterprise.sla.description')}</p>
          </div>
          <select value={days} onChange={e => setDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none">
            {[7, 30, 90].map(d => (
              <option key={d} value={d}>{d} {t('enterprise.sla.days')}</option>
            ))}
          </select>
        </div>

        {/* Uptime hero */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
          <div className={`text-6xl font-bold mb-2 ${uptimeColor}`}>
            {data?.uptime_percent?.toFixed(3) ?? '—'}%
          </div>
          <p className="text-gray-500 text-sm mb-3">{t('enterprise.sla.uptime')} · {t('enterprise.sla.target')}: 99.9%</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${data?.sla_met ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {data?.sla_met ? t('enterprise.sla.slaMet') : t('enterprise.sla.slaNotMet')}
          </span>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: t('enterprise.sla.currentStatus'), value: <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.badge}`}>{style.icon} {t(`enterprise.sla.status.${statusKey}`)}</span> },
            { label: t('enterprise.sla.avgResponse'), value: `${data?.stats?.avg_response_time_ms ?? 0} ${t('enterprise.sla.ms')}` },
            { label: t('enterprise.sla.totalChecks'), value: data?.stats?.total_checks ?? 0 },
            { label: t('enterprise.sla.incidents'), value: data?.incidents?.length ?? 0 },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-xl font-bold text-gray-900 mb-1">{card.value}</div>
              <div className="text-xs text-gray-400">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Recent checks timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3">{t('enterprise.sla.recentChecks')}</h2>
          {!data?.recent_checks?.length
            ? <p className="text-sm text-gray-400 italic">{t('enterprise.sla.noData')}</p>
            : <div className="flex flex-wrap gap-1">
                {[...data.recent_checks].reverse().map((c, i) => {
                  const s = statusStyle[c.status] || statusStyle.unknown;
                  return (
                    <div key={i} title={`${c.status} — ${c.response_time_ms}ms\n${new Date(c.checked_at).toLocaleString()}`}
                      className={`w-4 h-6 rounded-sm ${s.dot} cursor-default opacity-90`} />
                  );
                })}
              </div>
          }
        </div>

        {/* Incidents */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">{t('enterprise.sla.incidentsList')}</h2>
          {!data?.incidents?.length
            ? <p className="text-sm text-gray-400 italic">{t('enterprise.sla.noIncidents')}</p>
            : <div className="space-y-2">
                {data.incidents.map((inc, i) => {
                  const s = statusStyle[inc.status] || statusStyle.unknown;
                  return (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${s.dot}`} />
                        <span className="font-medium text-gray-800 capitalize">{t(`enterprise.sla.status.${inc.status}`)}</span>
                        {inc.error_message && <span className="text-gray-400 text-xs truncate max-w-xs">{inc.error_message}</span>}
                      </div>
                      <div className="text-xs text-gray-400 flex gap-3">
                        <span>{inc.response_time_ms}ms</span>
                        <span>{new Date(inc.checked_at).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      </div>
    </div>
  );
};

export default SLADashboard;

