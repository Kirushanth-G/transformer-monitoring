import React from 'react';

function NotificationsPopup({ notifications, onClose, onMarkAsRead }) {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
      <div className="py-2 px-3 bg-gray-100 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p>No notifications</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className="flex items-start p-3 border-b border-gray-100 hover:bg-gray-50"
              >
                <div className="flex-shrink-0 mt-1">
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <div className="ml-3 flex-grow">
                  <div 
                    className="text-sm text-gray-800 cursor-pointer"
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    {notification.message}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="py-2 px-3 bg-gray-100 text-center">
        <button 
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          onClick={() => onMarkAsRead('all')}
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
}

export default NotificationsPopup;