import React from 'react';
import { XIcon, BellIcon } from './ui/icons';

function NotificationsPopup({ notifications, onClose, onMarkAsRead }) {
  return (
    <div className='absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-md bg-white shadow-lg'>
      <div className='flex items-center justify-between bg-gray-100 px-3 py-2'>
        <h3 className='text-sm font-semibold text-gray-700'>Notifications</h3>
        <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
          <XIcon />
        </button>
      </div>

      <div className='max-h-80 overflow-y-auto'>
        {notifications.length === 0 ? (
          <div className='py-8 text-center text-gray-500'>
            <BellIcon className='mx-auto mb-2 h-10 w-10' />
            <p>No notifications</p>
          </div>
        ) : (
          <div>
            {notifications.map(notification => (
              <div
                key={notification.id}
                className='flex items-start border-b border-gray-100 p-3 hover:bg-gray-50'
              >
                <div className='mt-1 flex-shrink-0'>
                  {!notification.isRead && (
                    <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                  )}
                </div>
                <div className='ml-3 flex-grow'>
                  <div
                    className='cursor-pointer text-sm text-gray-800'
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    {notification.message}
                  </div>
                  <p className='mt-1 text-xs text-gray-500'>
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='bg-gray-100 px-3 py-2 text-center'>
        <button
          className='text-xs font-medium text-blue-600 hover:text-blue-800'
          onClick={() => onMarkAsRead('all')}
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
}

export default NotificationsPopup;
