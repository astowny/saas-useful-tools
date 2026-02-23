import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const POLL_INTERVAL_MS = 5000;

const VideoGenerator = () => {
  const { token } = useAuth();
  const [quota, setQuota] = useState(null);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null); // 'pending' | 'processing' | 'completed' | 'failed'
  const [videoUrl, setVideoUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [generating, setGenerating] = useState(false);
  const pollRef = useRef(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Charger le quota au montage
  const fetchQuota = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/video/quota`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setQuota(data);
    } catch (e) {
      console.error('Quota fetch error:', e);
    } finally {
      setQuotaLoading(false);
    }
  }, [token, apiUrl]);

  useEffect(() => { fetchQuota(); }, [fetchQuota]);

  // Polling du statut d'un job
  const pollStatus = useCallback(async (id) => {
    try {
      const res = await fetch(`${apiUrl}/api/video/status/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error?.message || 'Erreur'); setJobStatus('failed'); return; }

      setJobStatus(data.status);
      if (data.status === 'completed') {
        setVideoUrl(data.video_url);
        setGenerating(false);
        clearInterval(pollRef.current);
        fetchQuota(); // rafraîchir le quota
      } else if (data.status === 'failed') {
        setErrorMsg(data.error_message || 'La génération a échoué');
        setGenerating(false);
        clearInterval(pollRef.current);
      }
    } catch (e) {
      console.error('Poll error:', e);
    }
  }, [token, apiUrl, fetchQuota]);

  useEffect(() => {
    if (jobId && generating) {
      pollRef.current = setInterval(() => pollStatus(jobId), POLL_INTERVAL_MS);
      return () => clearInterval(pollRef.current);
    }
  }, [jobId, generating, pollStatus]);

  const handleGenerate = async () => {
    setErrorMsg(null);
    setVideoUrl(null);
    setJobStatus(null);
    setGenerating(true);
    try {
      const res = await fetch(`${apiUrl}/api/video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error?.message || 'Erreur');
        setGenerating(false);
        return;
      }
      setJobId(data.jobId);
      setJobStatus('pending');
    } catch (e) {
      setErrorMsg('Erreur réseau');
      setGenerating(false);
    }
  };

  const handleReset = () => {
    clearInterval(pollRef.current);
    setJobId(null); setJobStatus(null); setVideoUrl(null);
    setErrorMsg(null); setGenerating(false); setPrompt('');
    fetchQuota();
  };

  const isFreePlan = quota && quota.limit === 0;
  const noRemaining = quota && quota.limit !== -1 && quota.remaining === 0 && !isFreePlan;
  const canGenerate = !generating && !videoUrl && prompt.trim().length >= 10 && !isFreePlan && !noRemaining;

  const statusLabel = { pending: '⏳ En attente...', processing: '🎬 Génération en cours...', completed: '✅ Vidéo prête !', failed: '❌ Échec' };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/tools" className="text-blue-600 hover:text-blue-700 text-sm">← Retour aux outils</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">🎬 Générateur de vidéos IA</h1>
          <p className="text-gray-600 mt-1">Transformez un texte en vidéo grâce à MiniMax Hailuo 2.3</p>
        </div>

        {/* Quota badge */}
        {!quotaLoading && quota && (
          <div className={`rounded-lg p-3 mb-6 text-sm font-medium ${isFreePlan ? 'bg-amber-50 border border-amber-200 text-amber-800' : noRemaining ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-green-50 border border-green-200 text-green-800'}`}>
            {isFreePlan ? '🔒 Plan Free — génération vidéo non disponible' : quota.limit === -1 ? `✅ Plan ${quota.plan} — vidéos illimitées` : `🎬 Plan ${quota.plan} — ${quota.remaining} vidéo${quota.remaining !== 1 ? 's' : ''} restante${quota.remaining !== 1 ? 's' : ''} ce mois (${quota.used}/${quota.limit})`}
          </div>
        )}

        {/* Upgrade banner (Free plan) */}
        {isFreePlan && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6 text-white text-center">
            <p className="text-xl font-bold mb-2">🚀 Passez au plan Pro</p>
            <p className="text-blue-100 mb-4">Générez jusqu'à 5 vidéos IA par mois en qualité 768p avec le plan Pro, ou 30 vidéos 1080p avec Enterprise.</p>
            <Link to="/pricing" className="bg-white text-blue-700 font-semibold px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">Voir les plans</Link>
          </div>
        )}

        {/* Formulaire */}
        {!isFreePlan && !videoUrl && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Décrivez votre vidéo <span className="text-gray-400">({prompt.trim().length}/500 caractères, min. 10)</span>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              maxLength={500}
              placeholder="Ex: Un coucher de soleil sur l'océan, reflets dorés sur les vagues, style cinématographique..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={generating}
            />
            {errorMsg && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{errorMsg}</div>
            )}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`mt-4 w-full py-3 rounded-lg font-semibold transition-colors ${canGenerate ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              {generating ? '⏳ Génération en cours...' : '🎬 Générer la vidéo'}
            </button>
          </div>
        )}

        {/* Statut du job */}
        {generating && jobStatus && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="font-semibold text-gray-800">{statusLabel[jobStatus] || jobStatus}</p>
            <p className="text-sm text-gray-500 mt-1">La génération prend généralement entre 30 secondes et 2 minutes.</p>
          </div>
        )}

        {/* Résultat vidéo */}
        {videoUrl && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="font-semibold text-green-700 mb-3">✅ Vidéo générée avec succès !</p>
            <video src={videoUrl} controls className="w-full rounded-lg mb-4" />
            <div className="flex gap-3">
              <a href={videoUrl} download className="flex-1 text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                ⬇️ Télécharger
              </a>
              <button onClick={handleReset} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                🔄 Nouvelle vidéo
              </button>
            </div>
          </div>
        )}

        {/* Info technique */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <strong>🤖 Technologie :</strong> MiniMax Hailuo 2.3 via fal.ai · Pro : 768p · Enterprise : 1080p · Durée : 6 secondes
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
