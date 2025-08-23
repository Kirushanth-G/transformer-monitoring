import React, { useState, useEffect } from 'react';
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

  const [errors, setErrors] = useState({});

  // Status options
  const statusOptions = ['Pending', 'In Progress', 'Completed'];

  // Reset form when modal opens/closes or inspection changes
  useEffect(() => {
    if (isOpen && inspection) {
      // Parse inspection data
      const inspectedDate = inspection.inspectedAt
        ? new Date(inspection.inspectedAt).toISOString().slice(0, 16)
        : '';
      const maintenanceDate = inspection.maintenanceAt
        ? new Date(inspection.maintenanceAt).toISOString().slice(0, 16)
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
      newErrors.transformerId = 'Transformer ID is required';
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
    <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
      <div className='mx-4 w-full max-w-lg rounded-lg bg-white shadow-xl'>
        <div className='px-6 pt-6 pb-4'>
          {/* Header */}
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-lg font-medium text-gray-900'>
              Edit Inspection
            </h3>
            <button
              onClick={handleClose}
              className='rounded-md p-2 text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            >
              <XIcon className='h-5 w-5' />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Inspection Number */}
            <div>
              <label
                htmlFor='inspectionNo'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Inspection Number *
              </label>
              <input
                type='text'
                id='inspectionNo'
                name='inspectionNo'
                value={formData.inspectionNo}
                onChange={handleInputChange}
                className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.inspectionNo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter inspection number'
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
                Transformer ID *
              </label>
              <input
                type='text'
                id='transformerId'
                name='transformerId'
                value={formData.transformerId}
                onChange={handleInputChange}
                className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.transformerId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter transformer ID'
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
                className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.branch ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter branch'
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
          </form>
        </div>

        {/* Footer */}
        <div className='flex flex-row-reverse gap-3 bg-gray-50 px-6 py-3'>
          <button
            type='submit'
            onClick={handleSubmit}
            disabled={isLoading}
            className={`rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none ${
              isLoading
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Updating...' : 'Update Inspection'}
          </button>
          <button
            type='button'
            onClick={handleClose}
            disabled={isLoading}
            className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditInspectionModal;
