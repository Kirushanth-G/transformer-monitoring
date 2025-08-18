import { useState } from 'react';

// Custom hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = notification => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = id => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id),
    );
  };

  const showSuccess = (title, message) => {
    return addNotification({ type: 'success', title, message });
  };

  const showError = (title, message) => {
    return addNotification({ type: 'error', title, message });
  };

  const showWarning = (title, message) => {
    return addNotification({ type: 'warning', title, message });
  };

  const showInfo = (title, message) => {
    return addNotification({ type: 'info', title, message });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
