import React, { useEffect } from 'react';
import { CheckIcon, XIcon } from './ui/icons';

function NotificationManager({ notifications = [], removeNotification, onRemove }) {
  const handleRemove = removeNotification || onRemove || (() => {});

  return (
    <div className='fixed top-4 right-6 z-50 flex flex-col space-y-2'>
      {/* <div className='space-y-2'></div> */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => handleRemove(notification.id)}
        />
      ))}
    </div>
  );
}

function Notification({ notification, onClose }) {
  const { type, title, message, duration = 5000 } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon className='h-5 w-10 text-green-600' />;
      case 'error':
        return <XIcon className='h-5 w-5 text-red-600' />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`animate-slide-in-right relative w-72 max-w-sm transform rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out ${getNotificationStyles()}`}
    >
      <div className='flex items-start'>
        <div className='flex-shrink-0'>{getIcon()}</div>
        <div className='ml-3 w-0 flex-1'>
          {title && <p className='text-sm font-medium'>{title}</p>}
          {message && (
            <p className={`text-sm ${title ? 'mt-1' : ''}`}>{message}</p>
          )}
        </div>
        <div className='ml-4 flex flex-shrink-0'>
          <button
            className='inline-flex text-gray-400 transition duration-150 ease-in-out hover:text-gray-600 focus:text-gray-600 focus:outline-none'
            onClick={onClose}
          >
            <XIcon className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationManager;
