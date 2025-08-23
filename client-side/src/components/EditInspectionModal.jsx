import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './ui/icons';

function EditInspectionModal({
  isOpen,
  onClose,
  onSave,
  inspection,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    inspectionNo: '',
    transformerId: '',
    branch: '',
    inspectedAt: '',
    maintenanceAt: '',
    status: 'Pending',
  });

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  const [errors, setErrors] = useState({});

  // Status options
  const statusOptions = ['Pending', 'In Progress', 'Completed'];

  // Reset form when modal opens/closes or inspection changes
  useEffect(() => {
    if (isOpen && inspection) {
      // Helper function to format date to 'YYYY-MM-DDTHH:mm' in local time
      const formatToLocalDatetime = dateString => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      const inspectedDate = inspection.inspectedAt
        ? formatToLocalDatetime(inspection.inspectedAt)
        : '';
      const maintenanceDate = inspection.maintenanceAt
        ? formatToLocalDatetime(inspection.maintenanceAt)
        : '';

      setFormData({
        inspectionNo: inspection.inspectionNo || '',
        transformerId: inspection.transformerId || '',
        branch: inspection.branch || '',
        inspectedAt: inspectedDate,
        maintenanceAt: maintenanceDate,
        status: inspection.status || 'Pending',
      });
      setErrors({});
    }
  }, [isOpen, inspection]);

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

  // Handle input changes
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.inspectionNo.trim()) {
      newErrors.inspectionNo = 'Inspection number is required';
    }

    if (!formData.transformerId.trim()) {
      newErrors.transformerId = 'Transformer No is required';
    }

    if (!formData.branch.trim()) {
      newErrors.branch = 'Branch is required';
    }

    if (!formData.inspectedAt) {
      newErrors.inspectedAt = 'Inspection date and time is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data for API
    const submissionData = {
      inspectionNo: formData.inspectionNo,
      transformerId: formData.transformerId,
      branch: formData.branch,
      inspectedAt: new Date(formData.inspectedAt).toISOString(),
      maintenanceAt: formData.maintenanceAt
        ? new Date(formData.maintenanceAt).toISOString()
        : null,
      status: formData.status,
    };

    onSave(submissionData);
  };

  const handleModalClick = e => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Handle close
  const handleClose = () => {
    setFormData({
      inspectionNo: '',
      transformerId: '',
      branch: '',
      inspectedAt: '',
      maintenanceAt: '',
      status: 'Pending',
    });
    setErrors({});
    onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className='bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center p-4'
      onClick={handleModalClick}
    >
      <div className='absolute inset-0 bg-black/60 backdrop-blur-[2px]'></div>
      <div
        className='animate-fade-in relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl'
        onClick={e => e.stopPropagation()}
      >
        <div className='p-4 sm:p-6'>
          {/* Header */}
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-gray-800'>
              Edit Inspection
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className='rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            >
              <XIcon className='h-5 w-5' />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-3'>
            {/* Inspection Number */}
            <div>
              <label
                htmlFor='inspectionNo'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Inspection Number *
              </label>
              <input
                ref={firstInputRef}
                type='text'
                id='inspectionNo'
                name='inspectionNo'
                value={formData.inspectionNo}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.inspectionNo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter Inspection Number'
              />
              {errors.inspectionNo && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.inspectionNo}
                </p>
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
                className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.transformerId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter Transformer No'
              />
              {errors.transformerId && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.transformerId}
                </p>
              )}
            </div>

            {/* Branch */}
            <div>
              <label
                htmlFor='branch'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Branch *
              </label>
              <input
                type='text'
                id='branch'
                name='branch'
                value={formData.branch}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.branch ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter Branch'
              />
              {errors.branch && (
                <p className='mt-1 text-sm text-red-600'>{errors.branch}</p>
              )}
            </div>

            {/* Inspection Date and Time */}
            <div>
              <label
                htmlFor='inspectedAt'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Inspection Date & Time *
              </label>
              <input
                type='datetime-local'
                id='inspectedAt'
                name='inspectedAt'
                value={formData.inspectedAt}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.inspectedAt ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.inspectedAt && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.inspectedAt}
                </p>
              )}
            </div>

            {/* Maintenance Date and Time */}
            <div>
              <label
                htmlFor='maintenanceAt'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Maintenance Date & Time
              </label>
              <input
                type='datetime-local'
                id='maintenanceAt'
                name='maintenanceAt'
                value={formData.maintenanceAt}
                onChange={handleInputChange}
                disabled={isLoading}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor='status'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Status *
              </label>
              <select
                id='status'
                name='status'
                value={formData.status}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className='mt-1 text-sm text-red-600'>{errors.status}</p>
              )}
            </div>

            {/* Actions */}
            <div className='flex justify-end space-x-3 pt-3'>
              <button
                type='button'
                onClick={handleClose}
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
                {isLoading ? 'Updating...' : 'Update Inspection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditInspectionModal;
