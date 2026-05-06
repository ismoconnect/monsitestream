import { useState, useEffect } from 'react';
import { statsService } from '../services/statsService';
import { useAuth } from '../contexts/AuthContext';

export const useStats = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  // Charger les statistiques
  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      try {
        setLoading(true);
        const userStats = await statsService.getUserStats(currentUser.id);
        setStats(userStats);
        
        // Charger les activités récentes
        const activities = await statsService.getRecentActivity(currentUser.id);
        setRecentActivity(activities);
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
        setStats(statsService.getDefaultStats());
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [currentUser?.id]);

  // Incrémenter les vues de galerie
  const incrementGalleryViews = async (viewType = 'photo') => {
    if (!currentUser?.id) return;
    
    try {
      await statsService.incrementGalleryViews(currentUser.id, viewType);
      // Recharger les stats
      const updatedStats = await statsService.getUserStats(currentUser.id);
      setStats(updatedStats);
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
    }
  };

  // Incrémenter les sessions de streaming
  const incrementStreamingSessions = async (minutes = 0) => {
    if (!currentUser?.id) return;
    
    try {
      await statsService.incrementStreamingSessions(currentUser.id, minutes);
      // Recharger les stats
      const updatedStats = await statsService.getUserStats(currentUser.id);
      setStats(updatedStats);
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des sessions:', error);
    }
  };

  // Rafraîchir les statistiques
  const refreshStats = async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      const [userStats, activities] = await Promise.all([
        statsService.getUserStats(currentUser.id),
        statsService.getRecentActivity(currentUser.id)
      ]);
      setStats(userStats);
      setRecentActivity(activities);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    recentActivity,
    loading,
    incrementGalleryViews,
    incrementStreamingSessions,
    refreshStats
  };
};
