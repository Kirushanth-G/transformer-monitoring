import React, { useState } from 'react';
import NotificationsPopup from './NotificationsPopup';

function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New transformer inspection scheduled for Optimus Prime",
      time: "10 minutes ago",
      isRead: false
    },
    {
      id: 2,
      message: "Maintenance alert for Transformer #210292G",
      time: "2 hours ago",
      isRead: false
    },
    {
      id: 3,
      message: "Inspection report for Megatron is ready for review",
      time: "Yesterday",
      isRead: true
    },
    {
      id: 4,
      message: "System update completed successfully",
      time: "2 days ago",
      isRead: true
    }
  ]);

  // Handle marking notifications as read
  const markAsRead = (id) => {
    if (id === 'all') {
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } else {
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    }
  };

  // Get count of unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white shadow-sm p-4 flex justify-end">
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            className="text-gray-600 hover:text-gray-800 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Notification badge - red dot indicator */}
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
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
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 border border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        {/* User Info */}
        <div className="flex flex-col text-left">
          <span className="text-sm font-medium text-gray-800">John Smith</span>
          <span className="text-xs text-gray-500">john.smith@example.com</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;