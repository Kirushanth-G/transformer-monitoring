import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './ui/icons';

function AddInspectionModal({
  isOpen,
  onClose,
  onSave,
  transformerId = '',
  isLoading,
}) {
  const [formData, setFormData] = useState({
    branch: '',
    transformerId: '',
    inspectedAt: '',
  });

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Update form data when transformerId prop changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      transformerId: transformerId || '',
    }));
  }, [transformerId]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        branch: '',
        transformerId: transformerId || '',
        inspectedAt: '',
      });
    }
  }, [isOpen, transformerId]);

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
    if (!formData.branch.trim()) {
      alert('Branch is required');
      return;
    }

    if (!formData.transformerId.trim()) {
      alert('Transformer ID is required');
      return;
    }

    if (!formData.inspectedAt) {
      alert('Inspected date and time is required');
      return;
    }

    // Convert to ISO string format for API
    const submitData = {
      ...formData,
      inspectedAt: new Date(formData.inspectedAt).toISOString(),
    };

    onSave(submitData);
  };

  const handleModalClick = e => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Get current datetime for default value
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'
      onClick={handleModalClick}
    >
      <div className='animate-fade-in mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl'>
        {/* Header */}
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Add New Inspection
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
          {/* Branch */}
          <div>
            <label
              htmlFor='branch'
              className='mb-1 block text-sm font-medium text-gray-700'
            >
              Branch *
            </label>
            <input
              ref={firstInputRef}
              type='text'
              id='branch'
              name='branch'
              value={formData.branch}
              onChange={handleInputChange}
              disabled={isLoading}
              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100'
              placeholder='Enter branch name'
              required
            />
          </div>

          {/* Transformer ID */}
          <div>
            <label
              htmlFor='transformerId'
              className='mb-1 block text-sm font-medium text-gray-700'
            >
              Transformer ID *
            </label>
            <input
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

          {/* Inspected Date & Time */}
          <div>
            <label
              htmlFor='inspectedAt'
              className='mb-1 block text-sm font-medium text-gray-700'
            >
              Inspected Date & Time *
            </label>
            <input
              type='datetime-local'
              id='inspectedAt'
              name='inspectedAt'
              value={formData.inspectedAt || getCurrentDateTime()}
              onChange={handleInputChange}
              disabled={isLoading}
              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100'
              required
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
              {isLoading ? 'Adding...' : 'Add Inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddInspectionModal;
