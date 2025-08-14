import React, { useState } from 'react';

function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      {/* Settings Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'general' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-600 hover:text-blue-500'}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'notifications' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-600 hover:text-blue-500'}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'account' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-600 hover:text-blue-500'}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'system' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-600 hover:text-blue-500'}`}
          onClick={() => setActiveTab('system')}
        >
          System
        </button>
      </div>
      
      {/* Settings Content based on active tab */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'general' && (
          <div>
            <h3 className="text-lg font-medium mb-4">General Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select 
                  id="language" 
                  className="w-full max-w-xs border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select 
                  id="timezone" 
                  className="w-full max-w-xs border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                  <option>CST (Central Standard Time)</option>
                  <option>MST (Mountain Standard Time)</option>
                  <option>PST (Pacific Standard Time)</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input 
                  id="darkMode" 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="darkMode" className="ml-2 block text-sm font-medium text-gray-700">
                  Enable Dark Mode
                </label>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <div>
            <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
            <p className="text-gray-600 mb-4">Configure how you receive notifications.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <div className="flex items-center">
                  <input 
                    id="emailNotif" 
                    type="checkbox" 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium">System Alerts</p>
                  <p className="text-sm text-gray-500">Receive critical system alerts</p>
                </div>
                <div className="flex items-center">
                  <input 
                    id="systemAlerts" 
                    type="checkbox" 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium">Maintenance Reminders</p>
                  <p className="text-sm text-gray-500">Get reminded about scheduled maintenance</p>
                </div>
                <div className="flex items-center">
                  <input 
                    id="maintenanceReminders" 
                    type="checkbox" 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'account' && (
          <div>
            <h3 className="text-lg font-medium mb-4">Account Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input 
                  type="text" 
                  id="name"
                  defaultValue="John Smith"
                  className="w-full max-w-md border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input 
                  type="email" 
                  id="email"
                  defaultValue="john.smith@example.com"
                  className="w-full max-w-md border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'system' && (
          <div>
            <h3 className="text-lg font-medium mb-4">System Settings</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">System Version: 1.0.0</p>
                <p className="text-sm text-gray-600">Last Updated: August 14, 2025</p>
              </div>
              
              <div className="pt-4">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded mr-2">
                  Check for Updates
                </button>
                <button className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded">
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