import React, { useState, useRef, useEffect } from 'react';
import { TrashIcon, EditIcon } from './ui/icons';

function TransformerActionDropdown({
  transformer,
  onDelete,
  onEdit,
  isLoading,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdit = () => {
    onEdit(transformer);
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete transformer ${transformer.transformerId}? This action cannot be undone.`,
      )
    ) {
      onDelete(transformer.id);
      setIsOpen(false);
    }
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none ${
          isLoading ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
          <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
        </svg>
      </button>

      {isOpen && (
        <div className='animate-fade-in absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg'>
          <div className='py-1'>
            <button
              onClick={handleEdit}
              disabled={isLoading}
              className={`flex w-full items-center px-4 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50 ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <EditIcon className='mr-2 h-4 w-4' />
              Edit Transformer
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className={`flex w-full items-center px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <TrashIcon className='mr-2 h-4 w-4' />
              {isLoading ? 'Deleting...' : 'Delete Transformer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransformerActionDropdown;
