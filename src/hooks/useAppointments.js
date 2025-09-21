import { useState, useEffect } from 'react';
import { appointmentsService } from '../services/appointmentsService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export const useAppointments = (filters = {}) => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Charger les rendez-vous initiaux
  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const loadAppointments = async () => {
      try {
        setLoading(true);
        const userAppointments = await appointmentsService.getUserAppointments(currentUser.id, filters);
        setAppointments(userAppointments);
        
        // Charger les statistiques
        const appointmentStats = await appointmentsService.getAppointmentStats(currentUser.id);
        setStats(appointmentStats);
      } catch (error) {
        console.error('Erreur lors du chargement des rendez-vous:', error);
        showError('Erreur', 'Impossible de charger les rendez-vous');
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [currentUser?.id, JSON.stringify(filters)]);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!currentUser?.id) return;

    const unsubscribe = appointmentsService.onAppointmentsSnapshot(
      currentUser.id,
      (updatedAppointments) => {
        setAppointments(updatedAppointments);
        // Mettre à jour les stats
        appointmentsService.getAppointmentStats(currentUser.id).then(setStats);
      },
      filters
    );

    return unsubscribe;
  }, [currentUser?.id, JSON.stringify(filters)]);

  // Créer un nouveau rendez-vous
  const createAppointment = async (appointmentData) => {
    try {
      const result = await appointmentsService.createAppointment(currentUser.id, appointmentData);
      showSuccess('Rendez-vous créé', 'Votre rendez-vous a été programmé avec succès');
      return result;
    } catch (error) {
      showError('Erreur', 'Impossible de créer le rendez-vous');
      throw error;
    }
  };

  // Confirmer un rendez-vous
  const confirmAppointment = async (appointmentId) => {
    try {
      await appointmentsService.confirmAppointment(currentUser.id, appointmentId);
      showSuccess('Rendez-vous confirmé', 'Le rendez-vous a été confirmé');
      return { success: true };
    } catch (error) {
      showError('Erreur', 'Impossible de confirmer le rendez-vous');
      throw error;
    }
  };

  // Annuler un rendez-vous
  const cancelAppointment = async (appointmentId, reason = '') => {
    try {
      await appointmentsService.cancelAppointment(currentUser.id, appointmentId, reason);
      showSuccess('Rendez-vous annulé', 'Le rendez-vous a été annulé');
      return { success: true };
    } catch (error) {
      showError('Erreur', 'Impossible d\'annuler le rendez-vous');
      throw error;
    }
  };

  // Marquer comme terminé
  const completeAppointment = async (appointmentId, feedback = '') => {
    try {
      await appointmentsService.completeAppointment(currentUser.id, appointmentId, feedback);
      showSuccess('Rendez-vous terminé', 'Le rendez-vous a été marqué comme terminé');
      return { success: true };
    } catch (error) {
      showError('Erreur', 'Impossible de finaliser le rendez-vous');
      throw error;
    }
  };

  // Mettre à jour le paiement
  const updatePaymentStatus = async (appointmentId, paymentStatus, paymentDetails = {}) => {
    try {
      await appointmentsService.updatePaymentStatus(currentUser.id, appointmentId, paymentStatus, paymentDetails);
      showSuccess('Paiement mis à jour', 'Le statut de paiement a été mis à jour');
      return { success: true };
    } catch (error) {
      showError('Erreur', 'Impossible de mettre à jour le paiement');
      throw error;
    }
  };

  // Obtenir les prochains rendez-vous
  const getUpcoming = async (limit = 5) => {
    try {
      return await appointmentsService.getUpcomingAppointments(currentUser.id, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des prochains RDV:', error);
      return [];
    }
  };

  return {
    appointments,
    stats,
    loading,
    createAppointment,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    updatePaymentStatus,
    getUpcoming
  };
};
