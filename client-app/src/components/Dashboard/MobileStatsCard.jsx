import React from 'react';
import { motion } from 'framer-motion';

const MobileStatsCard = ({ title, value, icon: Icon, color, bgColor, description, trend }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${bgColor} rounded-xl p-4 border border-gray-100 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <h3 className="text-sm font-medium text-gray-600 truncate">{title}</h3>
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 truncate">{description}</p>
          )}
        </div>
        
        {trend && (
          <div className="ml-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.type === 'up' 
                ? 'bg-green-100 text-green-600' 
                : trend.type === 'down'
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MobileStatsCard;
