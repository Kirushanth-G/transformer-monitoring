import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import NotificationManager from '../components/NotificationManager';
import InspectionImageDisplay from '../components/InspectionImageDisplay';
import { useNotifications } from '../hooks/useNotifications';
import { displayValue, isNullValue } from '../utils/displayHelpers';
import axios from '../api/axiosConfig';

function InspectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notifications, removeNotification, showSuccess, showError } =
    useNotifications();

  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch inspection details
  useEffect(() => {
    const fetchInspectionDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/inspections/${id}`);
        setInspection(response.data);
      } catch (err) {
        console.error('Error fetching inspection details:', err);
        if (err.response?.status === 404) {
          setError('Inspection not found');
        } else {
          setError('Failed to load inspection details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInspectionDetails();
    }
  }, [id]);

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

  if (loading) {
    return (
      <div className='flex h-screen bg-[#E5E4E2]'>
        <Sidebar />
        <div className='ml-64 flex flex-1 items-center justify-center'>
          <LoadingSpinner message='Loading inspection details...' />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-screen bg-[#E5E4E2]'>
        <Sidebar />
        <div className='ml-64 flex flex-1 items-center justify-center p-8'>
          <div className='text-center'>
            <div className='mb-2 text-lg font-semibold text-red-600'>
              {error}
            </div>
            <button
              onClick={() => navigate('/inspections')}
              className='rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
            >
              Back to Inspections
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className='flex h-screen bg-[#E5E4E2]'>
        <Sidebar />
        <div className='ml-64 flex flex-1 items-center justify-center p-8'>
          <div className='text-center'>
            <div className='mb-2 text-lg font-semibold text-gray-600'>
              No inspection data available
            </div>
            <button
              onClick={() => navigate('/inspections')}
              className='rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
            >
              Back to Inspections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-[#E5E4E2]'>
      <Sidebar />

      <div className='ml-64 flex-1 overflow-auto'>
        <div className='p-8'>
          {/* Inspection Details Header */}
          <div className='mb-6 rounded-lg bg-white p-6 shadow-sm'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white'>
                  {inspection.inspectionNo?.charAt(0) || 'I'}
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-800'>
                    {displayValue(inspection.inspectionNo)}
                  </h1>
                  <p className='text-gray-600'>
                    Transformer No : {displayValue(inspection.transformerId)}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(inspection.status)}`}
                >
                  {displayValue(inspection.status)}
                </span>
                <button
                  onClick={() => navigate('/inspections')}
                  className='rounded-md bg-blue-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-300'
                >
                  Back to List
                </button>
              </div>
            </div>

            {/* Basic Information Grid */}
            <div className='grid grid-cols-1 gap-9 md:grid-cols-4'>
              <div className='rounded-lg bg-gray-200 p-4'>
                <h3 className='mb-1 text-sm font-medium text-gray-500 text-center'>
                  Inspected Date
                </h3>
                <p className='text-lg font-semibold text-gray-900' align='center'>
                  {formatDate(inspection.inspectedAt)}
                </p>
              </div>
              <div className='rounded-lg bg-gray-200 p-4'>
                <h3 className='mb-1 text-sm font-medium text-gray-500 text-center'>
                  Maintenance Date
                </h3>
                <p className='text-lg font-semibold text-gray-900' align='center'>
                  {formatDate(inspection.maintenanceAt)}
                </p>
              </div>
              {/* <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-1 text-sm font-medium text-gray-500'>
                  Transformer ID
                </h3>
                <p
                  className={`text-lg font-semibold ${isNullValue(inspection.transformerId) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                >
                  {displayValue(inspection.transformerId)}
                </p>
              </div> */}
            </div>
          </div>

          {/* Technical Parameters */}
          <div className='mb-6 rounded-lg bg-white p-6 shadow-sm'>
            <h2 className='mb-4 text-xl font-semibold text-gray-800'>
              Technical Parameters
            </h2>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-1 text-sm font-medium text-gray-500'>
                  Oil Level
                </h3>
                <p
                  className={`text-lg font-semibold ${isNullValue(inspection.oilLevel) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                >
                  {displayValue(inspection.oilLevel)}
                </p>
              </div>

              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-1 text-sm font-medium text-gray-500'>
                  Oil Temperature (°C)
                </h3>
                <p
                  className={`text-lg font-semibold ${isNullValue(inspection.oilTemperature) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                >
                  {displayValue(inspection.oilTemperature)}
                </p>
              </div>

              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-1 text-sm font-medium text-gray-500'>
                  Winding Temperature (°C)
                </h3>
                <p
                  className={`text-lg font-semibold ${isNullValue(inspection.windingTemperature) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                >
                  {displayValue(inspection.windingTemperature)}
                </p>
              </div>

              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-1 text-sm font-medium text-gray-500'>
                  Load Current (A)
                </h3>
                <p
                  className={`text-lg font-semibold ${isNullValue(inspection.loadCurrent) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                >
                  {displayValue(inspection.loadCurrent)}
                </p>
              </div>

              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-1 text-sm font-medium text-gray-500'>
                  Power Factor
                </h3>
                <p
                  className={`text-lg font-semibold ${isNullValue(inspection.powerFactor) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                >
                  {displayValue(inspection.powerFactor)}
                </p>
              </div>

              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-1 text-sm font-medium text-gray-500'>
                  Noise Level (dB)
                </h3>
                <p
                  className={`text-lg font-semibold ${isNullValue(inspection.noiseLevel) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                >
                  {displayValue(inspection.noiseLevel)}
                </p>
              </div>
            </div>
          </div>

          {/* Thermal Image Section */}
          <div className='mb-6 rounded-lg bg-white p-6 shadow-sm'>
            <h2 className='mb-4 text-xl font-semibold text-gray-800'>
              Thermal Image
            </h2>
            <div className='max-w-md'>
              <InspectionImageDisplay
                inspectionId={inspection.id}
                transformerId={inspection.transformerId}
                showSuccess={showSuccess}
                showError={showError}
              />
            </div>
          </div>

          {/* Weather Condition */}
          {inspection.environmentalCondition && (
            <div className='mb-6 rounded-lg bg-white p-6 shadow-sm'>
              <h2 className='mb-4 text-xl font-semibold text-gray-800'>
                Environmental Condition
              </h2>
              <div className='rounded-lg bg-gray-50 p-4'>
                <p className='text-lg text-gray-900'>
                  {displayValue(inspection.environmentalCondition)}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {inspection.notes && (
            <div className='mb-6 rounded-lg bg-white p-6 shadow-sm'>
              <h2 className='mb-4 text-xl font-semibold text-gray-800'>
                Notes
              </h2>
              <div className='rounded-lg bg-gray-50 p-4'>
                <p className='whitespace-pre-wrap text-gray-900'>
                  {displayValue(inspection.notes)}
                </p>
              </div>
            </div>
          )}

          {/* Progress Section (similar to your image) */}
          <div className='mb-6 rounded-lg bg-white p-6 shadow-sm'>
            <h2 className='mb-4 text-xl font-semibold text-gray-800'>
              Progress
            </h2>
            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100'>
                  <div className='h-3 w-3 rounded-full bg-green-600'></div>
                </div>
                <div className='flex-1'>
                  <p className='font-medium text-gray-900'>
                    Thermal Image Upload
                  </p>
                  <p className='text-sm text-gray-500'>
                    Image uploaded and processed
                  </p>
                </div>
                <span className='text-sm font-medium text-green-600'>
                  Completed
                </span>
              </div>

              <div className='flex items-center space-x-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
                  <div className='h-3 w-3 rounded-full bg-blue-600'></div>
                </div>
                <div className='flex-1'>
                  <p className='font-medium text-gray-900'>AI Analysis</p>
                  <p className='text-sm text-gray-500'>
                    Analyzing thermal patterns
                  </p>
                </div>
                <span className='text-sm font-medium text-yellow-600'>
                  In Progress
                </span>
              </div>

              <div className='flex items-center space-x-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
                  <div className='h-3 w-3 rounded-full bg-gray-400'></div>
                </div>
                <div className='flex-1'>
                  <p className='font-medium text-gray-900'>
                    Thermal Image Review
                  </p>
                  <p className='text-sm text-gray-500'>Manual review pending</p>
                </div>
                <span className='text-sm font-medium text-gray-500'>
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Manager */}
      <NotificationManager
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </div>
  );
}

export default InspectionDetailPage;
