import React from 'react';
import { XIcon } from './ui/icons';
import { displayValue, isNullValue } from '../utils/displayHelpers';
import InspectionImageDisplay from './InspectionImageDisplay';

function InspectionDetailModal({
  isOpen,
  onClose,
  inspection,
  showSuccess,
  showError,
}) {
  if (!isOpen || !inspection) return null;

  const formatDate = dateString => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div
          className='bg-opacity-50 fixed inset-0 bg-black transition-opacity'
          onClick={onClose}
        ></div>

        <div className='relative w-full max-w-4xl rounded-lg bg-white shadow-xl'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-gray-200 p-6'>
            <div>
              <h2 className='text-xl font-semibold text-gray-800'>
                Inspection Details
              </h2>
              <p className='text-sm text-gray-600'>
                Inspection #{displayValue(inspection.inspectionNo)}
              </p>
            </div>
            <button
              onClick={onClose}
              className='rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            >
              <XIcon className='h-6 w-6' />
            </button>
          </div>

          {/* Content */}
          <div className='p-6'>
            {/* Basic Information */}
            <div className='mb-6'>
              <h3 className='mb-4 text-lg font-medium text-gray-800'>
                Basic Information
              </h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Inspection Number
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(inspection.inspectionNo) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.inspectionNo)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Status
                  </h4>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(inspection.status)}`}
                  >
                    {displayValue(inspection.status)}
                  </span>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Transformer ID
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(inspection.transformerId) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.transformerId)}
                  </p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className='mb-6'>
              <h3 className='mb-4 text-lg font-medium text-gray-800'>Dates</h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Inspected Date
                  </h4>
                  <p className='text-lg font-semibold text-gray-900'>
                    {formatDate(inspection.inspectedAt)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Maintenance Date
                  </h4>
                  <p className='text-lg font-semibold text-gray-900'>
                    {formatDate(inspection.maintenanceAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className='mb-6'>
              <h3 className='mb-4 text-lg font-medium text-gray-800'>
                Technical Details
              </h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Oil Level
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(inspection.oilLevel) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.oilLevel)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Oil Temperature (°C)
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(inspection.oilTemperature) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.oilTemperature)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Winding Temperature (°C)
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(inspection.windingTemperature) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.windingTemperature)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Load Current (A)
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(inspection.loadCurrent) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.loadCurrent)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Power Factor
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(inspection.powerFactor) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.powerFactor)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Noise Level (dB)
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(inspection.noiseLevel) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.noiseLevel)}
                  </p>
                </div>
              </div>
            </div>

            {/* Inspection Image */}
            <div className='mb-6'>
              <h3 className='mb-4 text-lg font-medium text-gray-800'>
                Inspection Image
              </h3>
              <div className='max-w-md'>
                <InspectionImageDisplay
                  inspectionId={inspection.id}
                  showSuccess={showSuccess}
                  showError={showError}
                />
              </div>
            </div>

            {/* Notes */}
            {inspection.notes && (
              <div className='mb-6'>
                <h3 className='mb-4 text-lg font-medium text-gray-800'>
                  Notes
                </h3>
                <div className='rounded-lg bg-gray-50 p-4'>
                  <p className='whitespace-pre-wrap text-gray-900'>
                    {displayValue(inspection.notes)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='border-t border-gray-200 px-6 py-4'>
            <div className='flex justify-end'>
              <button
                onClick={onClose}
                className='rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InspectionDetailModal;
