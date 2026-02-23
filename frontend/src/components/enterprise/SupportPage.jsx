import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const statusColors = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

const SupportPage = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const API = process.env.REACT_APP_API_URL;

  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New ticket form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);

  // Reply form
  const [reply, setReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/enterprise/support`, { headers });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message); }
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token]); // eslint-disable-line

  const fetchTicketDetail = async (id) => {
    try {
      const res = await fetch(`${API}/api/enterprise/support/${id}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setSelected(data.ticket);
      setMessages(data.messages || []);
    } catch {}
  };

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/enterprise/support`, {
        method: 'POST', headers,
        body: JSON.stringify({ subject, message, priority })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message);
      setShowNew(false); setSubject(''); setMessage(''); setPriority('normal');
      fetchTickets();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selected) return;
    setSendingReply(true);
    try {
      const res = await fetch(`${API}/api/enterprise/support/${selected.id}/messages`, {
        method: 'POST', headers, body: JSON.stringify({ message: reply })
      });
      if (!res.ok) return;
      setReply('');
      fetchTicketDetail(selected.id);
    } catch {}
    finally { setSendingReply(false); }
  };

  if (loading) return <div className="p-8 text-gray-500">{t('common.loading')}</div>;

  // Detail view
  if (selected) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => { setSelected(null); setMessages([]); fetchTickets(); }}
          className="text-blue-600 hover:text-blue-700 text-sm mb-4">{t('enterprise.support.back')}</button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-gray-900">{selected.subject}</h2>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selected.status] || ''}`}>
              {t(`enterprise.support.status.${selected.status}`)}
            </span>
          </div>
          <p className="text-xs text-gray-400">{new Date(selected.created_at).toLocaleString()}</p>
        </div>
        <div className="space-y-3 mb-4">
          {messages.map(msg => (
            <div key={msg.id} className={`rounded-xl p-4 text-sm ${msg.is_staff ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-200'}`}>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-gray-700">{msg.is_staff ? t('enterprise.support.staff') : t('enterprise.support.you')}</span>
                <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</span>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))}
        </div>
        {selected.status !== 'closed' && (
          <form onSubmit={handleReply} className="bg-white rounded-xl border border-gray-200 p-4">
            <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
              placeholder={t('enterprise.support.replyPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3" />
            <button type="submit" disabled={sendingReply || !reply.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">
              {sendingReply ? '...' : t('enterprise.support.reply')}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  // List view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('enterprise.support.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('enterprise.support.description')}</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            {t('enterprise.support.newTicket')}
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">❌ {error}</div>}

        {/* New ticket modal */}
        {showNew && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold mb-4">{t('enterprise.support.newTicket')}</h3>
              <form onSubmit={handleCreateTicket} className="space-y-3">
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required
                  placeholder={t('enterprise.support.subjectPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} required
                  placeholder={t('enterprise.support.messagePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={priority} onChange={e => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['low','normal','high','urgent'].map(p => (
                    <option key={p} value={p}>{t(`enterprise.support.priorities.${p}`)}</option>
                  ))}
                </select>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm">
                    {submitting ? '...' : t('enterprise.support.send')}
                  </button>
                  <button type="button" onClick={() => setShowNew(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm">
                    {t('enterprise.apiKeys.modal.close')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tickets.length === 0
          ? <p className="text-center text-gray-400 italic mt-12">{t('enterprise.support.empty')}</p>
          : <div className="space-y-3">
              {tickets.map(ticket => (
                <button key={ticket.id} onClick={() => fetchTicketDetail(ticket.id)}
                  className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{ticket.subject}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status] || ''}`}>
                      {t(`enterprise.support.status.${ticket.status}`)}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-gray-400">
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    <span>{ticket.message_count} {t('enterprise.support.messages')}</span>
                    <span className="capitalize">{t(`enterprise.support.priorities.${ticket.priority}`)}</span>
                  </div>
                </button>
              ))}
            </div>
        }
      </div>
    </div>
  );
};

export default SupportPage;

