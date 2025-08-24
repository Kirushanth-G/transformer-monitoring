import React, { useState } from 'react';
import NotificationsPopup from './NotificationsPopup';
import { BellIcon, UserIcon } from './ui/icons';

// Hamburger menu icon component
const HamburgerIcon = ({ className }) => (
  <svg
    className={className}
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M4 6h16M4 12h16M4 18h16'
    />
  </svg>
);

function Topbar({ onToggleSidebar }) {
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
    <header className='flex items-center justify-between bg-white px-4 py-3 shadow-sm'>
      {/* Left side - Hamburger menu */}
      <div className='flex items-center'>
        <button
          onClick={onToggleSidebar}
          className='mr-3 rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800'
        >
          <HamburgerIcon className='h-6 w-6' />
        </button>

        {/* Page title - hidden on mobile to save space */}
        <h1 className='hidden text-lg font-semibold text-gray-800 sm:block'>
          PowerGrid Dashboard
        </h1>
      </div>

      {/* Right side - Notifications and user info */}
      <div className='flex items-center space-x-3 sm:space-x-4'>
        {/* Notification Bell */}
        <div className='relative'>
          <button
            className='relative rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800'
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <BellIcon className='h-5 w-5 sm:h-6 sm:w-6' />
            {/* Notification badge - red dot indicator */}
            {unreadCount > 0 && (
              <span className='absolute -top-1 -right-1 block flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
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
        <div className='flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-gray-200 text-gray-600 sm:h-10 sm:w-10'>
          <UserIcon className='h-4 w-4 sm:h-5 sm:w-5' />
        </div>

        {/* User Info - Hidden on mobile, shown as dropdown on small screens */}
        <div className='hidden flex-col text-left md:flex'>
          <span className='text-sm font-medium text-gray-800'>John Smith</span>
          <span className='text-xs text-gray-500'>john.smith@example.com</span>
        </div>

        {/* User info for tablet view */}
        <div className='hidden sm:block md:hidden'>
          <span className='text-sm font-medium text-gray-800'>John Smith</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
