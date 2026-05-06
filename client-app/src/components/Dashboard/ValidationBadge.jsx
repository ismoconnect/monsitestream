import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ValidationBadge = ({ user }) => {
  if (!user || !user.subscription) return null;

  const { status, plan, type, planName } = user.subscription;
  const planDisplay = plan || type || planName || 'Premium';

  const getBadgeConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'En attente de validation',
          bgColor: 'bg-gradient-to-r from-yellow-100 to-orange-100',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          borderColor: 'border-yellow-200'
        };
      case 'active':
        return {
          icon: CheckCircle,
          text: `Plan ${planDisplay.charAt(0).toUpperCase() + planDisplay.slice(1)} activé`,
          bgColor: 'bg-gradient-to-r from-green-100 to-emerald-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200'
        };
      case 'rejected':
        return {
          icon: XCircle,
          text: 'Demande refusée',
          bgColor: 'bg-gradient-to-r from-red-100 to-pink-100',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: AlertCircle,
          text: 'Statut inconnu',
          bgColor: 'bg-gradient-to-r from-gray-100 to-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl border ${config.bgColor} ${config.borderColor} shadow-sm`}
    >
      <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${config.iconColor}`} />
      <span className={`text-xs sm:text-sm font-medium ${config.textColor} truncate max-w-[100px] sm:max-w-none`}>
        <span className="sm:hidden">
          {status === 'active' ? `${planDisplay.charAt(0).toUpperCase()}${planDisplay.slice(1)}` : 'En attente'}
        </span>
        <span className="hidden sm:inline">
          {config.text}
        </span>
      </span>
      {status === 'pending' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-2 h-2 sm:w-3 sm:h-3"
        >
          <div className={`w-full h-full border-2 border-transparent border-t-yellow-600 rounded-full`}></div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ValidationBadge;
