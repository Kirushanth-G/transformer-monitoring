import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  PowerIcon,
  TransformerIcon,
  ClipboardIcon,
  SettingsIcon,
} from './ui/icons';

function Sidebar() {
  const navLinkClass = ({ isActive }) =>
    `flex items-center w-full px-4 py-2.5 rounded-lg transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
    }`;

  return (
    <aside className='fixed top-0 left-0 flex h-screen w-64 flex-col bg-gray-800 text-white'>
      {/* Company Logo and Name */}
      <div className='flex items-center space-x-3 border-b border-gray-700 p-4'>
        <div className='flex h-10 w-10 items-center justify-center rounded-md bg-blue-500'>
          <PowerIcon className='h-7 w-7' />
        </div>
        <h1 className='text-xl font-bold'>PowerGrid</h1>
      </div>

      {/* Navigation Links */}
      <nav className='flex-grow px-4 py-6'>
        <ul className='space-y-2'>
          <li>
            <NavLink to='/transformers' className={navLinkClass}>
              <TransformerIcon className='mr-3 h-5 w-5' />
              Transformers
            </NavLink>
          </li>
          <li>
            <NavLink to='/inspections' className={navLinkClass}>
              <ClipboardIcon className='mr-3 h-5 w-5' />
              Inspections
            </NavLink>
          </li>
          <li>
            <NavLink to='/settings' className={navLinkClass}>
              <SettingsIcon className='mr-3 h-5 w-5' />
              Settings
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
