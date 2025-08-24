import React, { useState } from 'react';

function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className='min-h-screen bg-[#E5E4E2] p-3 sm:p-6 lg:p-8'>
      {/* Header */}
      <div className='mb-4 sm:mb-6'>
        <h1 className='text-xl font-bold text-gray-800 sm:text-2xl'>
          Settings
        </h1>
        <p className='text-sm text-gray-600 sm:text-base'>
          Manage your application preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <div className='mb-4 overflow-x-auto sm:mb-6'>
        <div className='flex min-w-full border-b border-gray-200'>
          <button
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap sm:px-4 sm:text-base ${
              activeTab === 'general'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap sm:px-4 sm:text-base ${
              activeTab === 'notifications'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap sm:px-4 sm:text-base ${
              activeTab === 'account'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap sm:px-4 sm:text-base ${
              activeTab === 'system'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab('system')}
          >
            System
          </button>
        </div>
      </div>

      {/* Settings Content based on active tab */}
      <div className='rounded-lg bg-white p-4 shadow-md sm:p-6'>
        {activeTab === 'general' && (
          <div>
            <h3 className='mb-4 text-lg font-medium'>General Settings</h3>

            <div className='space-y-6'>
              <div>
                <label
                  htmlFor='language'
                  className='mb-1 block text-sm font-medium text-gray-700'
                >
                  Language
                </label>
                <select
                  id='language'
                  className='w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor='timezone'
                  className='mb-1 block text-sm font-medium text-gray-700'
                >
                  Timezone
                </label>
                <select
                  id='timezone'
                  className='w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
                >
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                  <option>CST (Central Standard Time)</option>
                  <option>MST (Mountain Standard Time)</option>
                  <option>PST (Pacific Standard Time)</option>
                </select>
              </div>

              <div className='flex items-center'>
                <input
                  id='darkMode'
                  type='checkbox'
                  className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <label
                  htmlFor='darkMode'
                  className='ml-2 block text-sm font-medium text-gray-700'
                >
                  Enable Dark Mode
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h3 className='mb-4 text-lg font-medium'>Notification Settings</h3>
            <p className='mb-4 text-gray-600'>
              Configure how you receive notifications.
            </p>

            <div className='space-y-4'>
              <div className='flex items-center justify-between border-b border-gray-100 py-2'>
                <div>
                  <p className='font-medium'>Email Notifications</p>
                  <p className='text-sm text-gray-500'>
                    Receive notifications via email
                  </p>
                </div>
                <div className='flex items-center'>
                  <input
                    id='emailNotif'
                    type='checkbox'
                    className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                </div>
              </div>

              <div className='flex items-center justify-between border-b border-gray-100 py-2'>
                <div>
                  <p className='font-medium'>System Alerts</p>
                  <p className='text-sm text-gray-500'>
                    Receive critical system alerts
                  </p>
                </div>
                <div className='flex items-center'>
                  <input
                    id='systemAlerts'
                    type='checkbox'
                    className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    defaultChecked
                  />
                </div>
              </div>

              <div className='flex items-center justify-between border-b border-gray-100 py-2'>
                <div>
                  <p className='font-medium'>Maintenance Reminders</p>
                  <p className='text-sm text-gray-500'>
                    Get reminded about scheduled maintenance
                  </p>
                </div>
                <div className='flex items-center'>
                  <input
                    id='maintenanceReminders'
                    type='checkbox'
                    className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    defaultChecked
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div>
            <h3 className='mb-4 text-lg font-medium'>Account Settings</h3>

            <div className='space-y-6'>
              <div>
                <label
                  htmlFor='name'
                  className='mb-1 block text-sm font-medium text-gray-700'
                >
                  Full Name
                </label>
                <input
                  type='text'
                  id='name'
                  defaultValue='John Smith'
                  className='w-full max-w-md rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
                />
              </div>

              <div>
                <label
                  htmlFor='email'
                  className='mb-1 block text-sm font-medium text-gray-700'
                >
                  Email Address
                </label>
                <input
                  type='email'
                  id='email'
                  defaultValue='john.smith@example.com'
                  className='w-full max-w-md rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
                />
              </div>

              <div>
                <button className='rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700'>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div>
            <h3 className='mb-4 text-lg font-medium'>System Settings</h3>

            <div className='space-y-4'>
              <div>
                <p className='text-sm text-gray-600'>System Version: 1.0.0</p>
                <p className='text-sm text-gray-600'>
                  Last Updated: August 14, 2025
                </p>
              </div>

              <div className='pt-4'>
                <button className='mr-2 rounded bg-gray-100 px-4 py-2 font-medium text-gray-800 hover:bg-gray-200'>
                  Check for Updates
                </button>
                <button className='rounded bg-red-100 px-4 py-2 font-medium text-red-800 hover:bg-red-200'>
                  Reset System
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
