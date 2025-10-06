import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  PowerIcon,
  TransformerIcon,
  ClipboardIcon,
  SettingsIcon,
  XIcon,
} from './ui/icons';

function Sidebar({ isOpen, onClose, isMobile }) {
  const navLinkClass = ({ isActive }) =>
    `flex items-center w-full px-4 py-2.5 rounded-lg transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
    }`;

  const handleNavClick = () => {
    // Close sidebar on mobile when navigation item is clicked
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={` ${
        isMobile
          ? `fixed top-0 left-0 z-50 h-screen w-64 transform transition-transform duration-300 ease-in-out ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : `fixed top-0 left-0 z-30 h-screen w-64 transform transition-transform duration-300 ease-in-out ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`
      } flex flex-col bg-gray-800 text-white`}
    >
      {/* Company Logo and Name */}
      <div className='flex items-center justify-between space-x-3 border-b border-gray-700 p-4'>
        <div className='flex items-center space-x-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-md bg-blue-500'>
            <PowerIcon className='h-7 w-7' />
          </div>
          <h1 className='text-xl font-bold'>PowerGrid</h1>
        </div>

        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={onClose}
            className='rounded-md p-1 transition-colors hover:bg-gray-700'
          >
            <XIcon className='h-5 w-5' />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className='flex-grow px-4 py-6'>
        <ul className='space-y-2'>
          <li>
            <NavLink
              to='/transformers'
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <TransformerIcon className='mr-3 h-5 w-5' />
              <span className='truncate'>Transformers</span>
            </NavLink>
          </li>
                    <li>
            <NavLink
              to='/inspections'
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <ClipboardIcon className='mr-3 h-5 w-5' />
              <span className='truncate'>Inspections</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/settings'
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <SettingsIcon className='mr-3 h-5 w-5' />
              <span className='truncate'>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Version Info at Bottom */}
      <div className='border-t border-gray-700 p-4 text-xs text-gray-400'>
        v1.0.0
      </div>
    </aside>
  );
}

export default Sidebar;
