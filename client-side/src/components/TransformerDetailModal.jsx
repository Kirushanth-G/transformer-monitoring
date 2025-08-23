import React from 'react';
import { XIcon } from './ui/icons';
import { displayValue, isNullValue } from '../utils/displayHelpers';
import TransformerImageDisplay from './TransformerImageDisplay';

function TransformerDetailModal({
  isOpen,
  onClose,
  transformer,
  showSuccess,
  showError,
}) {
  if (!isOpen || !transformer) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div
          className='bg-opacity-50 fixed inset-0 bg-black transition-opacity'
          onClick={onClose}
        ></div>

        <div className='relative w-full max-w-3xl rounded-lg bg-white shadow-xl'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-gray-200 p-6'>
            <div>
              <h2 className='text-xl font-semibold text-gray-800'>
                Transformer Details
              </h2>
              <p className='text-sm text-gray-600'>
                {displayValue(transformer.transformerId)}
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
                    Transformer ID
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(transformer.transformerId) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(transformer.transformerId)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Location
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(transformer.location) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(transformer.location)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Type
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(transformer.type) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(transformer.type)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Pole Number
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(transformer.poleNo) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(transformer.poleNo)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Rated Power (kVA)
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(transformer.ratedPower) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(transformer.ratedPower)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <h4 className='mb-1 text-sm font-medium text-gray-500'>
                    Voltage Rating
                  </h4>
                  <p
                    className={`text-lg font-semibold ${isNullValue(transformer.voltageRating) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(transformer.voltageRating)}
                  </p>
                </div>
              </div>
            </div>

            {/* Baseline Image */}
            <div className='mb-6'>
              <h3 className='mb-4 text-lg font-medium text-gray-800'>
                Baseline Image
              </h3>
              <div className='max-w-md'>
                <TransformerImageDisplay
                  transformerId={transformer.id}
                  showSuccess={showSuccess}
                  showError={showError}
                />
              </div>
            </div>

            {/* Additional Information */}
            {transformer.manufacturer && (
              <div className='mb-6'>
                <h3 className='mb-4 text-lg font-medium text-gray-800'>
                  Additional Information
                </h3>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='rounded-lg bg-gray-50 p-4'>
                    <h4 className='mb-1 text-sm font-medium text-gray-500'>
                      Manufacturer
                    </h4>
                    <p
                      className={`text-lg font-semibold ${isNullValue(transformer.manufacturer) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                    >
                      {displayValue(transformer.manufacturer)}
                    </p>
                  </div>

                  <div className='rounded-lg bg-gray-50 p-4'>
                    <h4 className='mb-1 text-sm font-medium text-gray-500'>
                      Year of Manufacture
                    </h4>
                    <p
                      className={`text-lg font-semibold ${isNullValue(transformer.yearOfManufacture) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                    >
                      {displayValue(transformer.yearOfManufacture)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Inspections */}
            {transformer.inspections && transformer.inspections.length > 0 && (
              <div className='mb-6'>
                <h3 className='mb-4 text-lg font-medium text-gray-800'>
                  Recent Inspections ({transformer.inspections.length})
                </h3>
                <div className='rounded-lg bg-gray-50 p-4'>
                  <p className='text-gray-700'>
                    Last inspection:{' '}
                    {transformer.inspections[0]?.inspectedAt
                      ? new Date(
                          transformer.inspections[0].inspectedAt,
                        ).toLocaleDateString()
                      : 'No recent inspections'}
                  </p>
                  <p className='mt-1 text-sm text-gray-500'>
                    Click "View Full Details" to see all inspections and
                    detailed information.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='border-t border-gray-200 px-6 py-4'>
            <div className='flex justify-between'>
              <button
                onClick={onClose}
                className='rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700'
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Navigate to detailed view
                  window.location.href = `/transformers/${transformer.id}`;
                }}
                className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransformerDetailModal;
