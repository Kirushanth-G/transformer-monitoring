import React from 'react';
import { XIcon, BellIcon } from './ui/icons';

function NotificationsPopup({ notifications, onClose, onMarkAsRead }) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className='bg-opacity-25 fixed inset-0 z-10 bg-black sm:hidden'
        onClick={onClose}
      ></div>

      {/* Popup container - responsive positioning */}
      <div className='fixed inset-x-0 top-16 z-20 mx-4 rounded-lg bg-white shadow-lg sm:absolute sm:top-2 sm:right-0 sm:left-auto sm:mx-0 sm:w-80 sm:rounded-md'>
        <div className='flex items-center justify-between rounded-t-lg bg-gray-100 px-3 py-2 sm:rounded-t-md'>
          <h3 className='text-sm font-semibold text-gray-700'>Notifications</h3>
          <button
            onClick={onClose}
            className='p-1 text-gray-500 hover:text-gray-700'
          >
            <XIcon className='h-4 w-4' />
          </button>
        </div>

        <div className='max-h-80 overflow-y-auto sm:max-h-80'>
          {notifications.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>
              <BellIcon className='mx-auto mb-2 h-8 w-8 sm:h-10 sm:w-10' />
              <p className='text-sm'>No notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className='flex items-start border-b border-gray-100 p-3 transition-colors hover:bg-gray-50'
                >
                  <div className='mt-1 flex-shrink-0'>
                    {!notification.isRead && (
                      <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                    )}
                  </div>
                  <div className='ml-3 min-w-0 flex-grow'>
                    <div
                      className='cursor-pointer text-sm leading-relaxed text-gray-800'
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

        <div className='rounded-b-lg bg-gray-100 px-3 py-2 text-center sm:rounded-b-md'>
          <button
            className='py-1 text-xs font-medium text-blue-600 hover:text-blue-800'
            onClick={() => onMarkAsRead('all')}
          >
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
}

export default NotificationsPopup;
