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
  const [errors, setErrors] = useState({}); // Added error state

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
        inspectedAt: getCurrentDateTime(), // Set default inspectedAt to current time
      });
      setErrors({}); // Clear errors on open
    }
  }, [isOpen, transformerId]);

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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.branch.trim()) {
      newErrors.branch = 'Branch is required';
    }

    if (!formData.transformerId.trim()) {
      newErrors.transformerId = 'Transformer ID is required';
    }

    if (!formData.inspectedAt) {
      newErrors.inspectedAt = 'Inspected date and time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleSubmit = e => {
    e.preventDefault();
    if (isLoading) return;

    if (validateForm()) {
      const submitData = {
        ...formData,
        inspectedAt: new Date(formData.inspectedAt).toISOString(),
      };
      onSave(submitData);
    }
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
      <div className='absolute inset-0 bg-black/60 backdrop-blur-[2px]'></div>
      <div
        className='relative animate-fade-in z-60 mx-4 w-full max-w-md rounded-lg bg-white shadow-xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 p-6'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Add New Inspection
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='text-gray-400 transition-colors hover:text-gray-600'
          >
            <XIcon className='h-6 w-6' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4 p-6'>
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
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                errors.branch ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter branch name'
            />
            {errors.branch && (
              <p className='mt-1 text-sm text-red-500'>{errors.branch}</p>
            )}
          </div>

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
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                errors.transformerId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter transformer No'
            />
            {errors.transformerId && (
              <p className='mt-1 text-sm text-red-500'>
                {errors.transformerId}
              </p>
            )}
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
              value={formData.inspectedAt}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                errors.inspectedAt ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.inspectedAt && (
              <p className='mt-1 text-sm text-red-500'>
                {errors.inspectedAt}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              disabled={isLoading}
              className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
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
