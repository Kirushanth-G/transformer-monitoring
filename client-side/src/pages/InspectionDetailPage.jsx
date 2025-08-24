import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
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

  // Mobile state management
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsMobile && setIsSidebarOpen(false);

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
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile}
        />
        {isMobile && isSidebarOpen && (
          <div
            className='bg-opacity-50 fixed inset-0 z-40 bg-black'
            onClick={closeSidebar}
          />
        )}
        <div
          className={`flex flex-1 flex-col transition-all duration-300 ${
            !isMobile && isSidebarOpen ? 'md:ml-64' : 'ml-0'
          }`}
        >
          <Topbar onToggleSidebar={toggleSidebar} />
          <div className='flex flex-1 items-center justify-center'>
            <LoadingSpinner message='Loading inspection details...' />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-screen bg-[#E5E4E2]'>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile}
        />
        {isMobile && isSidebarOpen && (
          <div
            className='bg-opacity-50 fixed inset-0 z-40 bg-black'
            onClick={closeSidebar}
          />
        )}
        <div
          className={`flex flex-1 flex-col transition-all duration-300 ${
            !isMobile && isSidebarOpen ? 'md:ml-64' : 'ml-0'
          }`}
        >
          <Topbar onToggleSidebar={toggleSidebar} />
          <div className='flex flex-1 items-center justify-center p-4 sm:p-8'>
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
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className='flex h-screen bg-[#E5E4E2]'>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile}
        />
        {isMobile && isSidebarOpen && (
          <div
            className='bg-opacity-50 fixed inset-0 z-40 bg-black'
            onClick={closeSidebar}
          />
        )}
        <div
          className={`flex flex-1 flex-col transition-all duration-300 ${
            !isMobile && isSidebarOpen ? 'md:ml-64' : 'ml-0'
          }`}
        >
          <Topbar onToggleSidebar={toggleSidebar} />
          <div className='flex flex-1 items-center justify-center p-4 sm:p-8'>
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
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-[#E5E4E2]'>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isMobile={isMobile}
      />
      {isMobile && isSidebarOpen && (
        <div
          className='bg-opacity-50 fixed inset-0 z-40 bg-black'
          onClick={closeSidebar}
        />
      )}

      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          !isMobile && isSidebarOpen ? 'md:ml-64' : 'ml-0'
        }`}
      >
        <Topbar onToggleSidebar={toggleSidebar} />

        <div className='flex-1 overflow-auto'>
          <div className='p-3 sm:p-6 lg:p-8'>
            {/* Inspection Details Header */}
            <div className='mb-4 rounded-lg bg-white p-4 shadow-sm sm:mb-6 sm:p-6'>
              <div className='mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                <div className='flex items-center'>
                  <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-base font-bold text-white sm:mr-4 sm:h-12 sm:w-12 sm:text-lg'>
                    {inspection.inspectionNo?.charAt(0) || 'I'}
                  </div>
                  <div>
                    <h1 className='text-xl font-bold text-gray-800 sm:text-2xl'>
                      {displayValue(inspection.inspectionNo)}
                    </h1>
                    <p className='text-sm text-gray-600 sm:text-base'>
                      Transformer No : {displayValue(inspection.transformerId)}
                    </p>
                  </div>
                </div>
                <div className='flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3'>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(inspection.status)}`}
                  >
                    {displayValue(inspection.status)}
                  </span>
                  <button
                    onClick={() => navigate('/inspections')}
                    className='w-full rounded-md bg-blue-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-300 sm:w-auto'
                  >
                    Back to List
                  </button>
                </div>
              </div>

              {/* Basic Information Grid */}
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4'>
                <div className='rounded-lg bg-gray-200 p-3 sm:p-4'>
                  <h3 className='mb-1 text-center text-xs font-medium text-gray-500 sm:text-sm'>
                    Inspected Date
                  </h3>
                  <p className='text-center text-base font-semibold text-gray-900 sm:text-lg'>
                    {formatDate(inspection.inspectedAt)}
                  </p>
                </div>
                <div className='rounded-lg bg-gray-200 p-3 sm:p-4'>
                  <h3 className='mb-1 text-center text-xs font-medium text-gray-500 sm:text-sm'>
                    Maintenance Date
                  </h3>
                  <p className='text-center text-base font-semibold text-gray-900 sm:text-lg'>
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
            <div className='mb-4 rounded-lg bg-white p-4 shadow-sm sm:mb-6 sm:p-6'>
              <h2 className='mb-3 text-lg font-semibold text-gray-800 sm:mb-4 sm:text-xl'>
                Technical Parameters
              </h2>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3'>
                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <h3 className='mb-1 text-xs font-medium text-gray-500 sm:text-sm'>
                    Oil Level
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(inspection.oilLevel) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.oilLevel)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <h3 className='mb-1 text-xs font-medium text-gray-500 sm:text-sm'>
                    Oil Temperature (°C)
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(inspection.oilTemperature) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.oilTemperature)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <h3 className='mb-1 text-xs font-medium text-gray-500 sm:text-sm'>
                    Winding Temperature (°C)
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(inspection.windingTemperature) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.windingTemperature)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <h3 className='mb-1 text-xs font-medium text-gray-500 sm:text-sm'>
                    Load Current (A)
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(inspection.loadCurrent) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.loadCurrent)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <h3 className='mb-1 text-xs font-medium text-gray-500 sm:text-sm'>
                    Power Factor
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(inspection.powerFactor) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.powerFactor)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <h3 className='mb-1 text-xs font-medium text-gray-500 sm:text-sm'>
                    Noise Level (dB)
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(inspection.noiseLevel) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.noiseLevel)}
                  </p>
                </div>
              </div>
            </div>

            {/* Thermal Image Section */}
            {/* Thermal Image Section */}
            <div className='mb-4 rounded-lg bg-white p-4 shadow-sm sm:mb-6 sm:p-6'>
              <h2 className='mb-3 text-lg font-semibold text-gray-800 sm:mb-4 sm:text-xl'>
                Thermal Image
              </h2>
              <div className='max-w-full sm:max-w-md'>
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
              <div className='mb-4 rounded-lg bg-white p-4 shadow-sm sm:mb-6 sm:p-6'>
                <h2 className='mb-3 text-lg font-semibold text-gray-800 sm:mb-4 sm:text-xl'>
                  Environmental Condition
                </h2>
                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <p className='text-base text-gray-900 sm:text-lg'>
                    {displayValue(inspection.environmentalCondition)}
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {inspection.notes && (
              <div className='mb-4 rounded-lg bg-white p-4 shadow-sm sm:mb-6 sm:p-6'>
                <h2 className='mb-3 text-lg font-semibold text-gray-800 sm:mb-4 sm:text-xl'>
                  Notes
                </h2>
                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <p className='text-sm whitespace-pre-wrap text-gray-900 sm:text-base'>
                    {displayValue(inspection.notes)}
                  </p>
                </div>
              </div>
            )}

            {/* Progress Section (similar to your image) */}
            <div className='mb-4 rounded-lg bg-white p-4 shadow-sm sm:mb-6 sm:p-6'>
              <h2 className='mb-3 text-lg font-semibold text-gray-800 sm:mb-4 sm:text-xl'>
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
                    <p className='text-sm text-gray-500'>
                      Manual review pending
                    </p>
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
    </div>
  );
}

export default InspectionDetailPage;
