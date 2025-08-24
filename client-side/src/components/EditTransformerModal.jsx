import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './ui/icons';

function EditTransformerModal({
  isOpen,
  onClose,
  onSave,
  transformer,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    transformerId: '',
    location: '',
    type: '',
    poleNo: '',
  });

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Update form data when transformer changes
  useEffect(() => {
    if (transformer) {
      setFormData({
        transformerId: transformer.transformerId || '',
        location: transformer.location || '',
        type: transformer.type || '',
        poleNo: transformer.poleNo || '',
      });
    }
  }, [transformer]);

  // Focus management
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (isLoading) return;

    // Basic validation
    if (!formData.transformerId.trim()) {
      alert('Transformer No is required');
      return;
    }

    onSave(formData);
  };

  const handleModalClick = e => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className='bg-opacity-60 fixed inset-0 z-50 flex items-center justify-center bg-black p-4 backdrop-blur-[2px]'
      onClick={handleModalClick}
    >
      <div className='animate-fade-in relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl sm:max-w-lg'>
        {/* Header */}
        <div className='sticky top-0 mb-4 flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-white p-4 sm:p-6'>
          <h2 className='text-lg font-semibold text-gray-800 sm:text-xl'>
            Edit Transformer
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          >
            <XIcon className='h-4 w-4 sm:h-5 sm:w-5' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4 p-4 pt-0 sm:p-6'>
          {/* Transformer ID */}
          <div>
            <label
              htmlFor='transformerId'
              className='mb-1 block text-sm font-medium text-gray-700'
            >
              Transformer No *
            </label>
            <input
              ref={firstInputRef}
              type='text'
              id='transformerId'
              name='transformerId'
              value={formData.transformerId}
              onChange={handleInputChange}
              disabled={isLoading}
              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100'
              placeholder='Enter Transformer No'
              required
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor='location'
              className='mb-1 block text-sm font-medium text-gray-700'
            >
              Location
            </label>
            <input
              type='text'
              id='location'
              name='location'
              value={formData.location}
              onChange={handleInputChange}
              disabled={isLoading}
              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100'
              placeholder='Enter Location'
            />
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor='type'
              className='mb-1 block text-sm font-medium text-gray-700'
            >
              Type
            </label>
            <select
              id='type'
              name='type'
              value={formData.type}
              onChange={handleInputChange}
              disabled={isLoading}
              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100'
            >
              <option value=''>Select type</option>
              <option value='Distribution'>Distribution</option>
              <option value='Bulk'>Bulk</option>
            </select>
          </div>

          {/* Pole Number */}
          <div>
            <label
              htmlFor='poleNo'
              className='mb-1 block text-sm font-medium text-gray-700'
            >
              Pole Number
            </label>
            <input
              type='text'
              id='poleNo'
              name='poleNo'
              value={formData.poleNo}
              onChange={handleInputChange}
              disabled={isLoading}
              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100'
              placeholder='Enter Pole Number'
            />
          </div>

          {/* Actions */}
          <div className='flex flex-col justify-end space-y-2 pt-4 sm:flex-row sm:space-y-0 sm:space-x-3'>
            <button
              type='button'
              onClick={onClose}
              disabled={isLoading}
              className='w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTransformerModal;
