import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook personnalisé pour gérer les quotas d'utilisation des outils
 */
export const useQuota = () => {
  const { token } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [quotaError, setQuotaError] = useState(null);

  /**
   * Vérifie et enregistre l'utilisation d'un outil
   * @param {string} toolName - Nom de l'outil
   * @param {string} category - Catégorie de l'outil
   * @returns {Promise<{success: boolean, quota?: object, error?: object}>}
   */
  const checkAndUseQuota = useCallback(async (toolName, category = 'general') => {
    setIsChecking(true);
    setQuotaError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tools/${toolName}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category })
      });

      const data = await response.json();

      if (!response.ok) {
        // Gérer les différents types d'erreurs de quota
        if (response.status === 429) {
          const error = {
            type: data.error.code,
            message: data.error.message,
            limit: data.error.limit,
            used: data.error.used
          };
          setQuotaError(error);
          return { success: false, error };
        } else if (response.status === 403) {
          const error = {
            type: 'NO_SUBSCRIPTION',
            message: data.error.message
          };
          setQuotaError(error);
          return { success: false, error };
        } else {
          throw new Error(data.error?.message || 'Erreur lors de la vérification du quota');
        }
      }

      return { success: true, quota: data.quota };
    } catch (error) {
      console.error('Quota check error:', error);
      const err = {
        type: 'NETWORK_ERROR',
        message: error.message || 'Erreur réseau'
      };
      setQuotaError(err);
      return { success: false, error: err };
    } finally {
      setIsChecking(false);
    }
  }, [token]);

  return {
    checkAndUseQuota,
    isChecking,
    quotaError,
    clearError: () => setQuotaError(null)
  };
};

