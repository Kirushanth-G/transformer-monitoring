import React from 'react';
import { NavLink } from 'react-router-dom';

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
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-7 w-7'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z'
              clipRule='evenodd'
            />
          </svg>
        </div>
        <h1 className='text-xl font-bold'>PowerGrid</h1>
      </div>

      {/* Navigation Links */}
      <nav className='flex-grow px-4 py-6'>
        <ul className='space-y-2'>
          <li>
            <NavLink to='/transformers' className={navLinkClass}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='mr-3 h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
              Transformers
            </NavLink>
          </li>
          <li>
            <NavLink to='/inspections' className={navLinkClass}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='mr-3 h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
                />
              </svg>
              Inspections
            </NavLink>
          </li>
          <li>
            <NavLink to='/settings' className={navLinkClass}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='mr-3 h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
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
