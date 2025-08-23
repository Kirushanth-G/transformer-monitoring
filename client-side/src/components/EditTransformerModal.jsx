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
      alert('Transformer ID is required');
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
      className='bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center'
      onClick={handleModalClick}
    >
    <div 
      className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      <div className='relative animate-fade-in mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl'>
        {/* Header */}
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Edit Transformer
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          >
            <XIcon className='h-5 w-5' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Transformer ID */}
          <div>
            <label
              htmlFor='transformerId'
              className='mb-1 block text-sm font-medium text-gray-700'
            >
              Transformer ID *
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
              placeholder='Enter transformer ID'
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
              placeholder='Enter location'
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
              placeholder='Enter pole number'
            />
          </div>

          {/* Actions */}
          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              disabled={isLoading}
              className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
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
