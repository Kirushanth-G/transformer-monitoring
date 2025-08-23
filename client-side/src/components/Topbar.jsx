import React, { useState } from 'react';
import NotificationsPopup from './NotificationsPopup';
import { BellIcon, UserIcon } from './ui/icons';

function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: 'New transformer inspection scheduled for T5',
      time: '10 minutes ago',
      isRead: false,
    },
    {
      id: 2,
      message: 'Maintenance alert for Transformer T1',
      time: '2 hours ago',
      isRead: false,
    },
    {
      id: 3,
      message: 'Inspection report for T3 is ready for review',
      time: 'Yesterday',
      isRead: true,
    },
    {
      id: 4,
      message: 'System update completed successfully',
      time: '2 days ago',
      isRead: true,
    },
  ]);

  // Handle marking notifications as read
  const markAsRead = id => {
    if (id === 'all') {
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } else {
      setNotifications(
        notifications.map(n => (n.id === id ? { ...n, isRead: true } : n)),
      );
    }
  };

  // Get count of unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className='flex justify-end bg-white p-4 shadow-sm'>
      <div className='flex items-center space-x-4'>
        {/* Notification Bell */}
        <div className='relative'>
          <button
            className='relative text-gray-600 hover:text-gray-800'
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <BellIcon />
            {/* Notification badge - red dot indicator */}
            {unreadCount > 0 && (
              <span className='absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500'></span>
            )}
          </button>

          {/* Notification Popup */}
          {showNotifications && (
            <NotificationsPopup
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
              onMarkAsRead={markAsRead}
            />
          )}
        </div>

        {/* Profile Picture */}
        <div className='flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-200 text-gray-600'>
          <UserIcon />
        </div>

        {/* User Info */}
        <div className='flex flex-col text-left'>
          <span className='text-sm font-medium text-gray-800'>John Smith</span>
          <span className='text-xs text-gray-500'>john.smith@example.com</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
