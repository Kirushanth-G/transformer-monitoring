import React from 'react';

function Sidebar({ onViewChange }) {
  // The activeView state is now managed internally in the Sidebar component
  const [activeView, setActiveView] = React.useState('transformers');

  // Handle navigation internally, then notify the parent component
  const handleNavigate = (view) => {
    setActiveView(view);
    onViewChange(view);
  };

  return (
    <aside className="h-screen w-64 bg-gray-800 text-white fixed left-0 top-0 flex flex-col">
      {/* Company Logo and Name */}
      <div className="p-4 border-b border-gray-700 flex items-center space-x-3">
        <div className="bg-blue-500 h-10 w-10 rounded-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-xl font-bold">PowerGrid</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow py-6 px-4">
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => handleNavigate('transformers')}
              className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-colors ${
                activeView === 'transformers' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Transformers
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavigate('settings')}
              className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-colors ${
                activeView === 'settings' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </li>
        </ul>
      </nav>

      {/* Version Info at Bottom */}
      <div className="p-4 text-xs text-gray-400 border-t border-gray-700">
        v1.0.0
      </div>
    </aside>
  );
}

export default Sidebar;