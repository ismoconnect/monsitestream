import React, { createContext, useContext, useState } from 'react';
import Notification from '../components/ui/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'info',
    title: '',
    message: '',
    duration: 5000
  });

  const showNotification = (type, title, message, duration = 5000) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message,
      duration
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  const showSuccess = (title, message, duration) => {
    showNotification('success', title, message, duration);
  };

  const showError = (title, message, duration) => {
    showNotification('error', title, message, duration);
  };

  const showWarning = (title, message, duration) => {
    showNotification('warning', title, message, duration);
  };

  const showInfo = (title, message, duration) => {
    showNotification('info', title, message, duration);
  };

  const value = {
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Notification
        isVisible={notification.isVisible}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        duration={notification.duration}
      />
    </NotificationContext.Provider>
  );
};
