import React, { useState } from 'react';
import { XIcon } from './ui/icons';

function AddTransformerModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    transformerId: '',
    location: '',
    type: '',
    poleNo: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.transformerId.trim()) {
      newErrors.transformerId = 'Transformer ID is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Type is required';
    }

    if (!formData.poleNo.trim()) {
      newErrors.poleNo = 'Pole No is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        await onSave(formData);
        handleClose();
      } catch (error) {
        // Error is already handled in the parent component
        console.error('Error in modal:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle modal close
  const handleClose = () => {
    setFormData({
      transformerId: '',
      location: '',
      type: '',
      poleNo: '',
    });
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center p-4'
      onClick={handleBackdropClick}
    >
      <div className='absolute inset-0 bg-black/60 backdrop-blur-[2px]'></div>
      <div
        className='animate-fade-in relative z-60 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl sm:max-w-lg'
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className='sticky top-0 flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-white p-4 sm:p-6'>
          <h2 className='text-lg font-semibold text-gray-800 sm:text-xl'>
            Add New Transformer
          </h2>
          <button
            onClick={handleClose}
            className='p-1 text-gray-400 transition-colors hover:text-gray-600'
          >
            <XIcon className='h-5 w-5 sm:h-6 sm:w-6' />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className='p-4 sm:p-6'>
          <div className='space-y-4'>
            {/* Transformer ID */}
            <div>
              <label
                htmlFor='transformerId'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Transformer No *
              </label>
              <input
                type='text'
                id='transformerId'
                name='transformerId'
                value={formData.transformerId}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base ${
                  errors.transformerId ? 'border-red-500' : 'border-gray-300'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                placeholder='Enter Transformer Number'
              />
              {errors.transformerId && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.transformerId}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor='location'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Location *
              </label>
              <input
                type='text'
                id='location'
                name='location'
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter Location'
              />
              {errors.location && (
                <p className='mt-1 text-sm text-red-600'>{errors.location}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label
                htmlFor='type'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Type *
              </label>
              <select
                id='type'
                name='type'
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value=''>Select type</option>
                <option value='Bulk'>Bulk</option>
                <option value='Distribution'>Distribution</option>
              </select>
              {errors.type && (
                <p className='mt-1 text-sm text-red-600'>{errors.type}</p>
              )}
            </div>

            {/* Pole No */}
            <div>
              <label
                htmlFor='poleNo'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Pole No *
              </label>
              <input
                type='text'
                id='poleNo'
                name='poleNo'
                value={formData.poleNo}
                onChange={handleInputChange}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base ${
                  errors.poleNo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter Pole Number'
              />
              {errors.poleNo && (
                <p className='mt-1 text-sm text-red-600'>{errors.poleNo}</p>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className='mt-6 flex flex-col items-center justify-end space-y-2 pt-4 sm:flex-row sm:space-y-0 sm:space-x-3'>
            <button
              type='button'
              onClick={handleClose}
              disabled={isLoading}
              className={`w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none sm:w-auto ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className={`w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-auto ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Transformer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransformerModal;
